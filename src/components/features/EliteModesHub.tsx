import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Activity, 
  Moon, 
  Zap, 
  Crown, 
  Wind,
  ChevronLeft,
  Brain,
  Cpu,
  Unplug
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Import sub-components
import AITitanProtocol from './AITitanProtocol';
import AIMatrixMode from './AIMatrixMode';
import AIShadowMode from './AIShadowMode';

type ModeId = 'grind' | 'focus' | 'monk' | null;

interface EliteModesHubProps {
  initialMode?: string;
  onExit: () => void;
  userStats: any;
}

const MODES = [
  { id: 'grind', label: 'Hardcore Grind', icon: <Flame />, color: 'rose', sub: 'Infinite Drive' },
  { id: 'focus', label: 'Deep Focus', icon: <Activity />, color: 'emerald', sub: 'Neural Clarity' },
  { id: 'monk', label: 'Silent Monk', icon: <Moon />, color: 'slate', sub: 'Total Isolation' },
];

export default function EliteModesHub({ initialMode, onExit, userStats }: EliteModesHubProps) {
  // Map incoming old IDs or action IDs to new ones
  const parseInitialMode = (mode?: string): ModeId => {
    if (!mode) return null;
    const clean = mode.replace('elite_hub:', '').replace('ai_', '');
    if (['grind', 'titan'].includes(clean)) return 'grind';
    if (['focus', 'matrix'].includes(clean)) return 'focus';
    if (['monk', 'shadow'].includes(clean)) return 'monk';
    return null;
  };

  const [activeMode, setActiveMode] = React.useState<ModeId>(parseInitialMode(initialMode));
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleModeChange = (id: ModeId) => {
    setIsSyncing(true);
    setTimeout(() => {
      setActiveMode(id);
      setIsSyncing(false);
    }, 600);
  };

  const renderActiveMode = () => {
    const commonProps = { performanceData: userStats };
    switch (activeMode) {
      case 'grind': return <AITitanProtocol {...commonProps} />;
      case 'focus': return <AIMatrixMode {...commonProps} />;
      case 'monk': return <AIShadowMode {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] text-white overflow-hidden flex flex-col">
      {/* Neural Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-3xl relative z-10">
        <button 
          onClick={activeMode ? () => handleModeChange(null) : onExit}
          className="w-10 h-10 rounded-2xl glass border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
            <h2 className="text-lg font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-indigo-400 to-emerald-400">
                {activeMode ? MODES.find(m => m.id === activeMode)?.label : 'Elite Hub'}
            </h2>
            <p className="text-[6px] font-black opacity-30 uppercase tracking-[0.5em] mt-0.5">Performance Engine v9.0</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Brain size={16} className="text-indigo-400 animate-pulse" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeMode ? (
            <motion.div
              key="mode-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="min-h-full"
            >
              {isSyncing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020202] z-50">
                  <Cpu className="text-indigo-500 animate-spin mb-4" size={32} />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Syncing Protocol...</p>
                </div>
              ) : renderActiveMode()}
            </motion.div>
          ) : (
            <motion.div
              key="mode-selector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 space-y-6 max-w-sm mx-auto"
            >
              <div className="grid grid-cols-2 gap-3">
                {MODES.map((mode, i) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id as ModeId)}
                    className="p-5 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.05] active:scale-95 transition-all relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl">
                      {React.cloneElement(mode.icon as React.ReactElement<any>, { 
                        size: 20, 
                        className: "opacity-40 group-hover:opacity-100" 
                      })}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black italic uppercase tracking-tighter text-[11px] leading-tight">{mode.label}</h3>
                      <p className="text-[7px] font-black opacity-30 uppercase tracking-widest">{mode.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <section className="p-8 rounded-[3rem] bg-indigo-600/5 border border-white/5 text-center space-y-4">
                <Unplug className="mx-auto text-indigo-400 opacity-40" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40">Bridge Active</h4>
                  <p className="text-[8px] font-black opacity-20 uppercase tracking-widest leading-relaxed">
                    Peak states require minimum 85% stability<br />All neural markers synchronized
                  </p>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Footer Controls */}
      {activeMode && (
        <motion.footer 
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/5 flex gap-4"
        >
          <button 
            onClick={() => handleModeChange(null)}
            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
          >
            Switch Protocol
          </button>
          <button 
            onClick={onExit}
            className="flex-1 py-4 rounded-2xl bg-rose-600 shadow-lg shadow-rose-600/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Exit Hub
          </button>
        </motion.footer>
      )}
    </div>
  );
}
