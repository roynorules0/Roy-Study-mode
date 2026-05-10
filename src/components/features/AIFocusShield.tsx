import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Battery, 
  AlertCircle, 
  Clock, 
  Pause, 
  Play, 
  Square,
  Maximize2,
  Minimize2,
  Trophy,
  BrainCircuit,
  MessageSquareQuote
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AIFocusShieldProps {
  onScoreUpdate?: (score: number) => void;
}

const MOTIVATIONS = [
  "Bhai focus wapas lao 🔥 Mission distract mat kar.",
  "Deep Work Mode on hai, don't break the streak!",
  "Consistency is power. Legend mode on. ⚡",
  "Top 1% discipline detected. Keep going!",
  "Discipline > Dopamine. Stay locked in. 🎯",
  "NEET warrior in focus mode! 🔥",
  "Your future self is watching. Don't let them down.",
  "Chalo chalo, back to study. Break time over! ⌛"
];

const WARNINGS = [
  "Neural drift detected! Focus wapas lao.",
  "Tab switching caught. Shield integrity dropping! 🛑",
  "Distraction detected. Discipline score decreasing.",
  "Padhai pe dhyan de bhai, Instagram nahi chalega! 😂"
];

export default function AIFocusShield({ onScoreUpdate }: AIFocusShieldProps) {
  const [isActive, setIsActive] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60);
  const [energy, setEnergy] = useState(100);
  const [distractions, setDistractions] = useState(0);
  const [showAlert, setShowAlert] = useState<string | null>(null);
  const [lastFocusTime, setLastFocusTime] = useState<number>(Date.now());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const distractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAlert = useCallback((msg: string) => {
    setShowAlert(msg);
    if (distractionTimeoutRef.current) clearTimeout(distractionTimeoutRef.current);
    distractionTimeoutRef.current = setTimeout(() => setShowAlert(null), 4000);
    
    // Haptic feedback if supported
    if (window.navigator?.vibrate) window.navigator.vibrate(200);
  }, []);

  // Distraction Detection
  useEffect(() => {
    if (!isActive) return;

    const handleBlur = () => {
      setDistractions(prev => prev + 1);
      setEnergy(prev => Math.max(0, prev - 15));
      const warning = WARNINGS[Math.floor(Math.random() * WARNINGS.length)];
      triggerAlert(warning);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleBlur();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isActive, triggerAlert]);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        // Slowly recover energy if no distractions
        setEnergy(prev => Math.min(100, prev + 0.01));
        
        // Random motivation every 10 mins
        if (Math.random() < 0.001) {
          const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
          triggerAlert(msg);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, triggerAlert]);

  const handleStart = (m: number) => {
    const s = m * 60;
    setDuration(s);
    setTimeLeft(s);
    setIsActive(true);
    setEnergy(100);
    setDistractions(0);
    triggerAlert("Focus Shield Active ⚡ Stay Locked-in!");
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsImmersive(false);
    const finalScore = Math.max(0, 100 - (distractions * 10));
    onScoreUpdate?.(finalScore);
    triggerAlert(`Session Complete! Discipline Score: ${finalScore}% 🏆`);
  };

  const stopSession = () => {
    setIsActive(false);
    setIsImmersive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "space-y-6 pb-24 transition-all duration-700",
      isImmersive ? "fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6" : "max-w-md mx-auto px-2"
    )}>
      {/* Background Glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-600/5 blur-[100px] rounded-full" />
             <motion.div 
               animate={{ opacity: [0.05, 0.1, 0.05] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 border-[20px] border-indigo-500/10 pointer-events-none"
             />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full space-y-6">
        <header className="flex justify-between items-center bg-white/5 p-4 rounded-[2rem] border border-white/5 glass">
           <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                isActive ? "bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-white/5"
              )}>
                 {isActive ? <ShieldCheck className="text-white animate-pulse" /> : <Shield className="opacity-40" />}
              </div>
              <div>
                 <h2 className="text-sm font-black uppercase italic tracking-wider">AI Focus Shield</h2>
                 <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
                   {isActive ? "Integrity: High" : "Dormant System"}
                 </p>
              </div>
           </div>
           {isActive && (
             <button 
               onClick={() => setIsImmersive(!isImmersive)}
               className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
             >
                {isImmersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
             </button>
           )}
        </header>

        {!isActive ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-2">
               {[25, 45, 90].map((m) => (
                 <button
                    key={m}
                    onClick={() => handleStart(m)}
                    className="p-6 rounded-[2rem] glass border border-white/5 hover:border-indigo-500/30 group transition-all"
                 >
                    <div className="text-2xl font-black italic mb-1 group-hover:text-indigo-400">{m}</div>
                    <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Minutes</div>
                 </button>
               ))}
            </div>
            
            <section className="p-6 rounded-[2.5rem] glass border border-white/5 space-y-4 text-center">
               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl mx-auto flex items-center justify-center text-indigo-500">
                  <BrainCircuit size={24} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase">Deep Neural Lock-in</h3>
                  <p className="text-[10px] opacity-40 px-8 leading-relaxed font-bold">
                    Activate the neural shield to block distractions and gain 2x discipline XP.
                  </p>
               </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="space-y-6"
          >
            {/* Big Interactive Timer */}
            <div className="text-center space-y-2 py-4">
               <motion.div 
                 animate={{ scale: [1, 1.02, 1] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="text-7xl font-black italic tracking-tighter tabular-nums"
               >
                 {formatTime(timeLeft)}
               </motion.div>
               <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Active Shield</span>
               </div>
            </div>

            {/* Performance Meters */}
            <div className="grid grid-cols-2 gap-3">
               <div className="p-5 rounded-[2rem] glass border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                     <Battery size={14} className={cn(energy < 30 ? "text-rose-500" : "text-emerald-500")} />
                     <span className="text-xs font-black italic">{Math.round(energy)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-emerald-500"
                       animate={{ width: `${energy}%` }}
                     />
                  </div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Mental Stamina</div>
               </div>

               <div className="p-5 rounded-[2rem] glass border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                     <Zap size={14} className="text-indigo-400" />
                     <span className="text-xs font-black italic">{distractions}</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className={cn(
                         "h-full flex-1 rounded-full",
                         i < distractions ? "bg-rose-500/50" : "bg-white/5"
                       )} />
                     ))}
                  </div>
                  <div className="text-[8px] font-black opacity-30 uppercase tracking-widest">Drift Events</div>
               </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
               <button 
                 onClick={stopSession}
                 className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors"
               >
                  <Square size={20} fill="currentColor" />
               </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Alerts */}
      <AnimatePresence>
        {showAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm"
          >
             <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-4 border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                   <MessageSquareQuote size={20} />
                </div>
                <p className="text-xs font-black uppercase italic leading-tight">{showAlert}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Widget (Bottom Overlay when active but not in tab) */}
      <AnimatePresence>
        {isActive && !isImmersive && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="hidden md:block fixed bottom-6 right-6 z-[90]"
          >
             <div className="glass p-3 rounded-2xl border border-indigo-500/30 flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-xs font-black tabular-nums">{formatTime(timeLeft)}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                   <Shield size={14} className="text-indigo-400" />
                   <span className="text-[10px] font-black uppercase opacity-40">Active</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
