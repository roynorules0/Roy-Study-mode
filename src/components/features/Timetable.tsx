import { useState } from 'react';
import { Clock, GripVertical, Sun, Moon } from 'lucide-react';
import { StudySession } from '../../types';
import { format12Hour } from '../../lib/dateUtils';
import { clsx } from 'clsx';

interface TimetableProps {
  sessions: StudySession[];
}

export default function Timetable({ sessions }: TimetableProps) {
  const [activeMode, setActiveMode] = useState<'day' | 'night'>('day');

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Study Timeline</h2>
          <p className="text-sm opacity-60">Your organized routine for today.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-2xl glass">
           <button 
             onClick={() => setActiveMode('day')}
             className={clsx("p-2 rounded-xl transition-all", activeMode === 'day' ? "bg-indigo-500 text-white shadow-lg" : "opacity-40")}
           >
              <Sun size={18} />
           </button>
           <button 
             onClick={() => setActiveMode('night')}
             className={clsx("p-2 rounded-xl transition-all", activeMode === 'night' ? "bg-indigo-500 text-white shadow-lg" : "opacity-40")}
           >
              <Moon size={18} />
           </button>
        </div>
      </header>

      <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/20">
        {sessions.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((session, idx) => (
          <div key={session.id} className="relative group">
            <div className="absolute -left-[29px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-lg shadow-indigo-500/20 z-10" />
            <div className="p-5 rounded-3xl glass-light border border-white/5 flex justify-between items-center gpu active:scale-[0.98] transition-transform cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${session.color}20`, color: session.color }}>
                  {session.type[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{session.title}</div>
                  <div className="text-xs opacity-50 font-medium">{format12Hour(session.startTime)} - {format12Hour(session.endTime)}</div>
                </div>
              </div>
              <GripVertical size={20} className="opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="p-12 text-center glass rounded-3xl opacity-30 mt-8">
            <p className="text-sm">Create a schedule in the AI Planner to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
