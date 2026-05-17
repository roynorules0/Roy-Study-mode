import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Brain, 
  Zap, 
  Flame, 
  Target, 
  ShieldCheck, 
  RefreshCcw, 
  Sparkles, 
  Share2, 
  Info,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Clock,
  Briefcase
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface DNAProfile {
  dnaType: string;
  insights: string[];
  stats: {
    discipline: number;
    burnoutResistance: number;
    memoryPower: number;
    focusEndurance: number;
    competitiveStamina: number;
  };
  recommendations: string[];
  description: string;
  color: string;
  lastAnalysis: number;
}

interface EvolutionData {
  timestamp: number;
  score: number;
}

export default function AIStudyDNA() {
  const [profile, setProfile] = useLocalStorage<DNAProfile | null>('ai-study-dna-v1', null);
  const [evolution, setEvolution] = useLocalStorage<EvolutionData[]>('ai-study-dna-evolution', []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  // Collect some real context from other features for the analysis
  const analyzeDNA = async () => {
    setIsAnalyzing(true);
    setAnalysisStep("Scanning Neural Pathways...");
    
    // Simulate data collection from localStorage
    const keys = [
      'focus-session-history', 
      'recall-history', 
      'ai-exam-history', 
      'study-missions-v2',
      'user-stats'
    ];
    const rawData: Record<string, any> = {};
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) rawData[key] = JSON.parse(val);
    });

    try {
      setAnalysisStep("Sequencing Behavioral Genome...");
      const response = await fetch("/api/gemini/analyze-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userContext: rawData }),
      });

      if (!response.ok) throw new Error("Failed to analyze DNA");
      
      const data = await response.json();
      const newProfile = {
        ...data,
        lastAnalysis: Date.now()
      };

      setProfile(newProfile);
      
      // Update evolution data
      const avgScore = Object.values(newProfile.stats as Record<string, number>).reduce((a, b) => a + b, 0) / 5;
      setEvolution(prev => [...prev, { timestamp: Date.now(), score: avgScore }].slice(-10));
      
      setAnalysisStep("DNA Synthesis Complete!");
      setTimeout(() => setIsAnalyzing(false), 1500);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const chartData = useMemo(() => {
    if (!profile) return [];
    return [
      { subject: 'Discipline', A: profile.stats.discipline, fullMark: 100 },
      { subject: 'Burnout Res.', A: profile.stats.burnoutResistance, fullMark: 100 },
      { subject: 'Memory', A: profile.stats.memoryPower, fullMark: 100 },
      { subject: 'Focus', A: profile.stats.focusEndurance, fullMark: 100 },
      { subject: 'Stamina', A: profile.stats.competitiveStamina, fullMark: 100 },
    ];
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-24 font-sans overflow-x-hidden selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none"
          >
            <Dna size={300} strokeWidth={0.5} />
          </motion.div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles size={12} /> Neural Personality Engine
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-br from-white via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            AI Study DNA
          </h1>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest px-8">Discover your unique learning genome and productivity archetype</p>
        </div>

        {!profile && !isAnalyzing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center space-y-8 rounded-[3rem] bg-indigo-600/5 border-2 border-dashed border-indigo-500/20"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse rounded-full" />
              <Dna size={80} className="text-indigo-400 relative z-10 mx-auto" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Your DNA is Unsequenced</h3>
              <p className="text-sm opacity-50 px-8">Run deep neural analysis to understand your study personality, focus patterns, and learning efficiency.</p>
            </div>
            <button 
              onClick={analyzeDNA}
              className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Zap size={18} fill="currentColor" /> Initialize Sequencing
            </button>
          </motion.div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-500/30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Dna size={48} className="text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-indigo-400">{analysisStep}</h3>
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Top DNA Card */}
            <div className="p-8 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <Dna size={120} />
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2 aspect-square max-w-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
                      <Radar
                        name="DNA"
                        dataKey="A"
                        stroke={profile?.color || "#818cf8"}
                        fill={profile?.color || "#818cf8"}
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Primary Archetype</div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                      {profile?.dnaType}
                    </h2>
                  </div>
                  <p className="text-sm font-bold opacity-60 leading-relaxed italic">
                    "{profile?.description}"
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                    {Object.entries(profile?.stats || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {key.replace(/([A-Z])/g, ' $1')}: <span className="text-indigo-400">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Lightbulb size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">Neural Insights</h4>
                </div>
                <ul className="space-y-3">
                  {(profile?.insights || []).map((insight, i) => (
                    <li key={i} className="flex gap-3 text-xs font-bold leading-relaxed opacity-80 italic">
                      <Zap size={14} className="shrink-0 text-amber-400" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-cyan-500/10 border border-cyan-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">DNA Strategy</h4>
                </div>
                <ul className="space-y-3">
                  {(profile?.recommendations || []).map((rec, i) => (
                    <li key={i} className="flex gap-3 text-xs font-bold leading-relaxed opacity-80">
                      <Target size={14} className="shrink-0 text-cyan-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Evolution Trend */}
            {evolution.length > 1 && (
              <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Genome Evolution</div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">Discipline Curve</h4>
                  </div>
                  <TrendingUp size={24} className="opacity-20" />
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolution}>
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#818cf8" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} 
                      />
                      <XAxis hide dataKey="timestamp" />
                      <YAxis hide domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ display: 'none' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] opacity-30">
                  <span>Initial Synthesis</span>
                  <span>Latest Scan</span>
                </div>
              </div>
            )}

            {/* DNA Breakdown Table */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 px-2">Sub-Personality Matrix</h3>
              <div className="space-y-2">
                {[
                  { label: 'Deep Focus Compatibility', value: profile?.stats.focusEndurance, icon: <Brain size={14} /> },
                  { label: 'Burnout Recovery Speed', value: profile?.stats.burnoutResistance, icon: <RefreshCcw size={14} /> },
                  { label: 'Memory Link Integrity', value: profile?.stats.memoryPower, icon: <ShieldCheck size={14} /> },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-crosshair">
                    <div className="flex items-center gap-3">
                      <div className="text-indigo-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tighter opacity-60">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-black italic tracking-tighter tabular-nums w-8">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                onClick={analyzeDNA}
                className="flex-1 py-6 rounded-3xl bg-indigo-500 text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <RefreshCcw size={18} /> Resynthesize DNA
              </button>
              <button 
                className="w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <Share2 size={20} />
              </button>
            </div>
            
            <p className="text-[10px] font-bold opacity-30 text-center uppercase tracking-widest">
              Last genome sync: {new Date(profile?.lastAnalysis || 0).toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
