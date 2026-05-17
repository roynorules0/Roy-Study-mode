import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SmartWallpaperState } from '../types';
import { cn } from '../lib/utils';

export default function BackgroundEngine() {
  const [state] = useLocalStorage<SmartWallpaperState>('ai-smart-wallpaper-v1', {
    currentTheme: 'Cyber Grind',
    intensity: 80,
    speed: 50,
    isBatterySaver: false,
    isAutoSwitch: true,
    aiReaction: "Deep work atmosphere activated ⚡",
    lastUpdate: Date.now()
  });

  const [globalPrefs] = useLocalStorage<any>('user-preferences', {});
  const glowLimit = (globalPrefs?.glowIntensity ?? 100) / 100;
  const animLimit = (globalPrefs?.animationIntensity ?? 100) / 100;
  const isBatterySaverGlobal = globalPrefs?.isBatterySaver ?? false;

  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsReduced(document.body.classList.contains('is-streaming-video'));
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    setIsReduced(document.body.classList.contains('is-streaming-video'));

    return () => observer.disconnect();
  }, []);

  const { currentTheme, speed, intensity: wallpaperIntensity } = state;
  const isBatterySaver = state.isBatterySaver || isBatterySaverGlobal;

  const renderBackground = () => {
    // Optimization: Return static background if battery saver, performance mode, or very low glow is set
    if (isBatterySaver || isReduced || glowLimit < 0.05) return <div className="fixed inset-0 bg-[#050505] -z-50" />;

    const effectiveIntensity = (wallpaperIntensity / 100) * glowLimit;
    const effectiveSpeed = (speed / 50) * animLimit;

    switch (currentTheme) {
      case 'Cyber Grind':
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none transition-all">
            {/* Grid */}
            <div 
              className="absolute inset-0 opacity-[0.08]" 
              style={{
                backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                transform: `perspective(1000px) rotateX(60deg) translateY(${speed/2}px)`,
                animation: effectiveSpeed > 0.1 ? `gridMove ${15 / effectiveSpeed}s linear infinite` : 'none'
              }}
            />
            {/* Neon Pulses */}
            <motion.div 
              animate={effectiveSpeed > 0.1 ? { 
                opacity: [0.03 * effectiveIntensity, 0.12 * effectiveIntensity, 0.03 * effectiveIntensity],
                scale: [1, 1.05, 1]
              } : { opacity: 0.08 * effectiveIntensity }}
              transition={{ duration: 10 / effectiveSpeed, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"
            />
          </div>
        );
      
      case 'Rain Study':
        const rainCount = Math.floor(25 * animLimit);
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020617] pointer-events-none">
             {/* Rain drops - Optimized count for performance */}
             <div className="absolute inset-0 opacity-[0.08]">
                {effectiveSpeed > 0.1 && Array.from({ length: rainCount }).map((_, i) => (
                   <motion.div 
                     key={i}
                     initial={{ y: -100, x: `${Math.random() * 100}%` }}
                     animate={{ y: '120vh' }}
                     transition={{ 
                        duration: (Math.random() * 1.5 + 1) / effectiveSpeed, 
                        repeat: Infinity, 
                        ease: 'linear',
                        delay: Math.random() * 3
                     }}
                     className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
                   />
                ))}
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
          </div>
        );

      case 'Deep Space':
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none">
             {Array.from({ length: 60 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30"
                  style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                />
             ))}
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(139,92,246,0.03)_100%)]"
             />
          </div>
        );

      case 'Morning':
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-[#fff7ed] dark:bg-[#0c0a09] pointer-events-none">
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-400/5 blur-[200px] rounded-full" />
             {Array.from({ length: 15 }).map((_, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: '100%' }}
                   animate={{ opacity: [0, 0.2, 0], y: '-10%', x: `${Math.random() * 10 - 5}%` }}
                   transition={{ duration: Math.random() * 15 + 10, repeat: Infinity, delay: Math.random() * 5 }}
                   className="absolute w-1 h-1 bg-orange-200/20 rounded-full"
                   style={{ left: `${Math.random() * 100}%` }}
                />
             ))}
          </div>
        );

      case 'Elite Exam':
         return (
           <div className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none">
              <div className="absolute inset-0 opacity-5 flex gap-8 rotate-12 -translate-y-20">
                 {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div 
                       key={i}
                       animate={{ y: ['-100%', '100%'] }}
                       transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                      className="w-[1px] h-full bg-rose-500"
                    />
                 ))}
              </div>
           </div>
         );

      case 'Anime Focus':
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-[#fafaf9] dark:bg-[#1c1917] pointer-events-none">
             {Array.from({ length: 3 }).map((_, i) => (
                <motion.div 
                   key={i}
                   initial={{ x: '-100%' }}
                   animate={{ x: '250%' }}
                   transition={{ duration: 100 + i * 20, repeat: Infinity, ease: 'linear' }}
                   className="absolute h-60 bg-white/10 blur-[100px] rounded-full"
                   style={{ top: `${20 + i * 20}%`, width: `${400 + Math.random() * 300}px` }}
                />
             ))}
          </div>
        );

      case 'Recovery':
        return (
          <div className="fixed inset-0 -z-50 overflow-hidden bg-[#09090b] pointer-events-none">
             <motion.div 
                animate={{ 
                   opacity: [0.05, 0.2, 0.05],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#10b98111_0%,_transparent_80%)]"
             />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentTheme + (isReduced ? '-reduced' : '')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      >
        {renderBackground()}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gridMove {
            from { transform: perspective(1000px) rotateX(60deg) translateY(0); }
            to { transform: perspective(1000px) rotateX(60deg) translateY(40px); }
          }
          .is-streaming-video .no-complex-animations *,
          .no-complex-animations * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        `}} />
      </motion.div>
    </AnimatePresence>
  );
}
