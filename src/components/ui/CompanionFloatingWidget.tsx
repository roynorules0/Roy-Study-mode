import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Minus, Globe, Hand, MoreHorizontal } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CompanionState, AnalyticsData } from '../../types';
import { getCompanionResponse, Personality } from '../../services/companionService';
import { cn } from '../../lib/utils';

interface CompanionFloatingWidgetProps {
  apiKey?: string;
  analytics?: AnalyticsData[];
}

export default function CompanionFloatingWidget({ apiKey, analytics }: CompanionFloatingWidgetProps) {
  const [companion, setCompanion] = useLocalStorage<CompanionState>('ai-companion-state', {
    personality: 'mentor',
    mood: 'motivated',
    lastMessage: 'Grind time!',
    isFloating: false,
    energy: 100
  });

  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Personality UI Map
  const UI_MAP: Record<string, { icon: string; color: string; shadow: string }> = {
    mentor: { icon: '😤', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    friend: { icon: '😎', color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    senpai: { icon: '🌸', color: 'bg-pink-500', shadow: 'shadow-pink-500/20' },
    coach: { icon: '🔥', color: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
    monk: { icon: '🧘', color: 'bg-teal-500', shadow: 'shadow-teal-500/20' },
    rival: { icon: '⚡', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
  };

  const ui = UI_MAP[companion.personality] || UI_MAP.mentor;

  // React to tab switching or something
  useEffect(() => {
    if (!companion.isFloating || !apiKey) return;

    const interval = setInterval(async () => {
      // Randomly speak every 5-10 mins if no interaction
      if (Math.random() < 0.1 && !isTyping) {
        setIsTyping(true);
        const res = await getCompanionResponse(apiKey, companion.personality as Personality, "Passive study mode");
        setMessage(res.text);
        setCompanion(prev => ({ ...prev, mood: res.mood as any, lastMessage: res.text }));
        setIsTyping(false);
        setTimeout(() => setMessage(null), 8000);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [companion.isFloating, apiKey]);

  if (!companion.isFloating) return null;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 80, clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 80, clientY - dragOffset.current.y))
    });
  };

  const handleDragEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={widgetRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-[999] pointer-events-none flex flex-col items-center gap-2"
    >
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="pointer-events-auto bg-zinc-900 border border-white/10 p-3 rounded-2xl shadow-2xl max-w-[180px]"
          >
             <p className="text-[10px] font-bold italic leading-tight text-white/90">
               {message}
             </p>
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={cn(
          "pointer-events-auto w-16 h-16 rounded-3xl flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing border-2 border-white/10 shadow-2xl transition-all duration-500",
          ui.color,
          ui.shadow,
          isDragging && "scale-110",
          isMinimized && "w-10 h-10 text-xl opacity-40 rounded-full"
        )}
      >
         <motion.div 
           animate={companion.mood === 'happy' ? { scale: [1, 1.1, 1] } : companion.mood === 'serious' ? { y: [-1, 1, -1] } : {}}
           transition={{ duration: 1, repeat: Infinity }}
         >
           {ui.icon}
         </motion.div>

         {/* Energy Ring */}
         <svg className="absolute inset-0 w-full h-full p-1 -rotate-90">
            <circle cx="50%" cy="50%" r="45%" className="stroke-white/10 fill-none" strokeWidth="2" />
            <circle 
              cx="50%" cy="50%" r="45%" 
              className="stroke-white fill-none" 
              strokeWidth="2" 
              strokeDasharray="100" 
              strokeDashoffset={100 - companion.energy} 
            />
         </svg>

         {isTyping && (
           <div className="absolute -top-1 -right-1 flex gap-0.5 p-1 bg-indigo-500 rounded-full">
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
           </div>
         )}
      </motion.div>
      
      {!isMinimized && (
        <div className="pointer-events-auto flex gap-1">
           <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg bg-black/40 text-white/40 hover:text-white transition-colors">
              <Minus size={10} />
           </button>
           <button onClick={() => setCompanion({...companion, isFloating: false})} className="p-1.5 rounded-lg bg-black/40 text-rose-500/40 hover:text-rose-500 transition-colors">
              <X size={10} />
           </button>
        </div>
      )}
      
      {isMinimized && (
        <button onClick={() => setIsMinimized(false)} className="pointer-events-auto p-1.5 rounded-lg bg-black/40 text-white/40">
           <MoreHorizontal size={10} />
        </button>
      )}
    </div>
  );
}
