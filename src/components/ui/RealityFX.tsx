import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RealityModeState } from '../../types';
import { cn } from '../../lib/utils';

export default function RealityFX() {
  const [reality] = useLocalStorage<RealityModeState>('reality-mode-v1', {
    isActive: false,
    environment: 'cyber',
    intensity: 'calm',
    auraLevel: 0,
    activeMission: null,
    atmosphere: { particles: false, rain: false, glow: false }
  });

  if (!reality.isActive) return null;

  const bgColors: Record<string, string> = {
    cyber: 'bg-fuchsia-900/10',
    anime: 'bg-blue-900/10',
    bunker: 'bg-orange-900/10',
    library: 'bg-emerald-900/10',
    space: 'bg-indigo-900/10'
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-colors duration-1000">
      {/* Base Tint */}
      <div className={cn("absolute inset-0 transition-all duration-1000", bgColors[reality.environment])} />

      {/* Grid Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] invert" />

      {/* Atmospheric Particles */}
      {reality.atmosphere.particles && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-110%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity, 
                delay: Math.random() * 20 
              }}
              className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}

      {/* Rain Effect (Cyber/Anime) */}
      {reality.atmosphere.rain && (reality.environment === 'cyber' || reality.environment === 'anime') && (
        <div className="absolute inset-0 overflow-hidden">
           {Array.from({ length: 30 }).map((_, i) => (
             <motion.div 
               key={i}
               initial={{ x: Math.random() * 100 + "%", y: -100 }}
               animate={{ y: window.innerHeight + 100 }}
               transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
               className="absolute w-px h-10 bg-gradient-to-b from-transparent to-white/10"
             />
           ))}
        </div>
      )}

      {/* Deep Focus Glow */}
      {reality.atmosphere.glow && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/10 via-transparent to-indigo-500/10 blur-[100px]"
        />
      )}

      {/* Corner Overlays */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
