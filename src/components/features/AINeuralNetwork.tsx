import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Zap, 
  Brain, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  RefreshCcw,
  ShieldCheck,
  Target,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NeuralNode {
  id: string;
  label: string;
  type: 'subject' | 'habit' | 'weak_topic' | 'strength';
  strength: number;
  x: number;
  y: number;
}

interface NeuralLink {
  source: string;
  target: string;
  strength: number;
  active: boolean;
}

interface NeuralData {
  stabilityScore: number;
  networkStrength: number;
  overloadRisk: 'Low' | 'Medium' | 'High' | 'CRITICAL';
  commentary: string;
  connections: { source: string; target: string; strength: number; label: string }[];
  smartRoute: string[];
  evolutionStage: string;
}

const DEFAULT_NODES: NeuralNode[] = [
  { id: 'physics', label: 'Physics', type: 'subject', strength: 75, x: 30, y: 30 },
  { id: 'maths', label: 'Maths', type: 'subject', strength: 85, x: 70, y: 30 },
  { id: 'chem', label: 'Chemistry', type: 'subject', strength: 60, x: 50, y: 60 },
  { id: 'bio', label: 'Biology', type: 'subject', strength: 40, x: 20, y: 70 },
  { id: 'focus', label: 'Focus Habits', type: 'habit', strength: 90, x: 80, y: 70 },
  { id: 'retention', label: 'Recall Power', type: 'strength', strength: 65, x: 50, y: 20 },
];

const DEFAULT_LINKS: NeuralLink[] = [
  { source: 'maths', target: 'physics', strength: 90, active: true },
  { source: 'physics', target: 'chem', strength: 60, active: true },
  { source: 'focus', target: 'maths', strength: 80, active: false },
  { source: 'bio', target: 'retention', strength: 40, active: true },
];

export default function AINeuralNetwork() {
  const [data, setData] = useState<NeuralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [view, setView] = useState<'map' | 'routes' | 'analytics'>('map');

  useEffect(() => {
    const saved = localStorage.getItem('ai_neural_data');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      // Initial simulated analysis
      triggerAnalysis();
    }
  }, []);

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      // simulate localized data update - in real use, we'd pass actual app state
      const mockContext = { 
        subjects: ['Physics', 'Maths', 'Chemistry'], 
        recentFocus: 'Organic Chem',
        weakTopics: ['Electromagnetism', 'Inorganic Chem']
      };

      const response = await fetch('/api/gemini/neural-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContext: mockContext })
      });

      if (!response.ok) throw new Error('Neural core error');
      
      const result = await response.json();
      setData(result);
      localStorage.setItem('ai_neural_data', JSON.stringify(result));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentNodes = useMemo(() => DEFAULT_NODES, []);
  
  const currentLinks = useMemo(() => {
    if (!data) return DEFAULT_LINKS;
    // Map backend connections to link format
    return data.connections.map(c => ({
      source: c.source.toLowerCase(),
      target: c.target.toLowerCase(),
      strength: c.strength,
      active: c.strength > 70
    })).filter(l => 
        currentNodes.some(n => n.id === l.source) && 
        currentNodes.some(n => n.id === l.target)
    ).concat(DEFAULT_LINKS);
  }, [data, currentNodes]);

  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_transparent_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Main UI */}
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800/50 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Network className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                NEURAL NETWORK CORE
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>DYNAMIC SYNC ACTIVE</span>
                <span className="opacity-30">|</span>
                <span className="text-cyan-400/80">CORE STATUS: {data?.evolutionStage || 'IDLE'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end px-4 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Stability</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{data?.stabilityScore || 0}%</span>
            </div>
            <div className="flex flex-col items-end px-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Strength</span>
              <span className="text-xl font-bold font-mono text-fuchsia-400">{data?.networkStrength || 0}%</span>
            </div>
            <button 
              onClick={triggerAnalysis}
              disabled={loading}
              className="ml-4 p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
          <button 
            onClick={() => setView('map')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'map' ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
            )}
          >MAP VIEW</button>
          <button 
            onClick={() => setView('routes')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'routes' ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
            )}
          >SMART ROUTES</button>
          <button 
            onClick={() => setView('analytics')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'analytics' ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
            )}
          >EVOLUTION</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Visualizer Area */}
          <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800/40 rounded-3xl relative h-[600px] overflow-hidden group">
            <AnimatePresence mode="wait">
              {view === 'map' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full p-8"
                >
                  <svg className="w-full h-full overflow-visible">
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Links */}
                    {currentLinks.map((link, idx) => {
                      const sourceNode = currentNodes.find(n => n.id === link.source);
                      const targetNode = currentNodes.find(n => n.id === link.target);
                      if (!sourceNode || !targetNode) return null;

                      return (
                        <g key={`link-${idx}`}>
                          <motion.line 
                            x1={`${sourceNode.x}%`} 
                            y1={`${sourceNode.y}%`} 
                            x2={`${targetNode.x}%`} 
                            y2={`${targetNode.y}%`}
                            stroke={link.active ? "#22d3ee" : "#334155"}
                            strokeWidth={link.strength / 40}
                            strokeOpacity={0.2}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: idx * 0.2 }}
                          />
                          {link.active && (
                            <motion.circle
                              r="2"
                              fill="#22d3ee"
                              filter="url(#glow)"
                            >
                              <animateMotion
                                dur={`${3 - link.strength/50}s`}
                                repeatCount="infinity"
                                path={`M ${sourceNode.x * 6} ${sourceNode.y * 5} L ${targetNode.x * 6} ${targetNode.y * 5}`}
                              />
                            </motion.circle>
                          )}
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {currentNodes.map((node) => (
                      <motion.g 
                        key={node.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setActiveNode(node.id === activeNode ? null : node.id)}
                        className="cursor-pointer"
                      >
                        <circle 
                          cx={`${node.x}%`} 
                          cy={`${node.y}%`} 
                          r={node.strength / 4} 
                          fill={node.id === activeNode ? "#22d3ee" : "#0f172a"}
                          stroke={node.type === 'weak_topic' ? "#ef4444" : "#334155"}
                          strokeWidth="2"
                          className="transition-colors duration-300"
                        />
                        <foreignObject 
                          x={`${node.x}%`} 
                          y={`${node.y}%`} 
                          width="120" 
                          height="40" 
                          className="overflow-visible pointer-events-none"
                          style={{ transform: 'translate(-60px, 15px)' }}
                        >
                          <div className="flex flex-col items-center">
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                node.id === activeNode ? "bg-cyan-500 text-black border-cyan-400" : "bg-black/50 text-slate-400 border-slate-700"
                            )}>
                              {node.label}
                            </span>
                            <span className="text-[8px] text-slate-600 mt-1 uppercase tracking-tighter">
                              Power: {node.strength}%
                            </span>
                          </div>
                        </foreignObject>
                      </motion.g>
                    ))}
                  </svg>
                </motion.div>
              ) : view === 'routes' ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 space-y-8"
                >
                   <div className="space-y-2">
                     <h3 className="text-xl font-black italic text-cyan-400">SMART LEARNING ROUTES</h3>
                     <p className="text-xs text-slate-500 uppercase tracking-widest">AI generated mastery paths for detected weak nodes</p>
                   </div>

                   <div className="space-y-4">
                     {data?.smartRoute.map((step, i) => (
                       <div key={i} className="flex items-center gap-4 group">
                         <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-500 font-bold">
                           {i + 1}
                         </div>
                         <div className="flex-1 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl group-hover:border-cyan-500/50 transition-colors">
                            <span className="text-sm font-bold text-slate-200">{step}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-cyan-500"
                                  />
                               </div>
                               <span className="text-[10px] text-slate-500">Route Efficiency: 92%</span>
                            </div>
                         </div>
                         <ChevronRight className="text-slate-700" />
                       </div>
                     ))}
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8"
                >
                  <div className="grid grid-cols-2 gap-4 h-full">
                     <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                        <TrendingUp className="w-12 h-12 text-emerald-400" />
                        <h4 className="text-lg font-bold">Evolution Stage</h4>
                        <span className="text-2xl font-black text-cyan-400">{data?.evolutionStage.toUpperCase()}</span>
                     </div>
                     <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                        <Brain className="w-12 h-12 text-fuchsia-400" />
                        <h4 className="text-lg font-bold">Recall Strength</h4>
                        <span className="text-2xl font-black text-fuchsia-400">OPTIMAL</span>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Insight Box */}
            <div className="bg-gradient-to-br from-cyan-900/10 to-transparent border border-cyan-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Zap className="w-5 h-5 fill-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest">Neural Insights</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic text-slate-300">
                "{data?.commentary || 'Calculating baseline neural connections...'}"
              </p>
              <div className="pt-4 border-t border-cyan-900/30 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      data?.overloadRisk === 'Low' ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <span className="text-[10px] text-slate-400">OVERLOAD RISK: <span className="text-white font-bold">{data?.overloadRisk}</span></span>
                 </div>
                 <button className="text-[10px] text-cyan-500 font-bold hover:underline">OPTIMIZE NETWORK</button>
              </div>
            </div>

            {/* Neural Strength Section */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 space-y-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> NODE STABILITY
               </h3>
               
               <div className="space-y-4">
                  {[
                    { label: 'Calculus Path', val: 88, color: 'bg-cyan-500' },
                    { label: 'Historical Focus', val: 42, color: 'bg-amber-500' },
                    { label: 'Deep Work Sync', val: 95, color: 'bg-emerald-500' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{stat.label}</span>
                          <span>{stat.val}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.val}%` }}
                            className={cn("h-full", stat.color)}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* AI Network Missions */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 space-y-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Target className="w-4 h-4 text-fuchsia-500" /> ACTIVE MISSIONS
               </h3>
               
               <div className="space-y-3">
                  {[
                    'Strengthen "Organic Chem" Node',
                    'Repair "Inorganic" Memory Leak',
                    'Expand Focus Connection x2',
                  ].map((mission, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-xl hover:border-fuchsia-500/30 transition-colors cursor-pointer group">
                       <div className="w-2 h-2 rounded-full bg-fuchsia-500 group-hover:scale-125 transition-transform" />
                       <span className="text-[11px] font-bold text-slate-300">{mission}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Mini HUD Info */}
            <div className="flex gap-4">
               <div className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-center">
                  <div className="text-[10px] text-slate-500 mb-1">LEARNING EFF.</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">9.4/10</div>
               </div>
               <div className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-center">
                  <div className="text-[10px] text-slate-500 mb-1">FOCUS SYNC</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">ALIGNED</div>
               </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 flex items-center justify-center gap-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Nodes: {currentNodes.length}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Edges: {currentLinks.length}</span>
           </div>
           <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Dynamic Evolution: Stage 4 ALPHA</span>
           </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-48 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -top-48 -right-48 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
