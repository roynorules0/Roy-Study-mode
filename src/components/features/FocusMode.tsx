import { motion } from 'motion/react';
import { X, Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';

interface FocusModeProps {
  timeLeft: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onExit: () => void;
}

export default function FocusMode({ timeLeft, isActive, onPause, onResume, onReset, onExit }: FocusModeProps) {
  const { theme } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 ${
        theme === 'night' ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <button 
        onClick={onExit}
        className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <X size={32} />
      </button>

      <div className="flex flex-col items-center gap-12 w-full max-w-md">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
           <Flame className="text-orange-500" size={18} />
           <span className="text-sm font-semibold tracking-wider uppercase">Focus Session</span>
        </div>

        <div className="text-[8rem] sm:text-[12rem] font-black tracking-tighter leading-none tabular-nums">
           {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>

        <div className="flex gap-6 w-full">
           <button 
             onClick={isActive ? onPause : onResume}
             className="flex-1 h-24 rounded-[2rem] bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative overflow-hidden group"
           >
             <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
             {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
           </button>
           
           <button 
             onClick={onReset}
             className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
           >
             <RotateCcw size={32} />
           </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
           <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
              <div className="text-xs opacity-50 uppercase tracking-widest mb-1">Daily Streak</div>
              <div className="text-2xl font-bold">12 Days</div>
           </div>
           <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
              <div className="text-xs opacity-50 uppercase tracking-widest mb-1">Goal</div>
              <div className="text-2xl font-bold">4.5h / 6h</div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
