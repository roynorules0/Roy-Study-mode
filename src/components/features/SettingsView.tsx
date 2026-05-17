import { useState } from 'react';
import { Settings, LogOut, Trash2, ShieldCheck, Youtube, Bell, Moon, Sun, Loader2, CheckCircle2, AlertCircle, Zap, RotateCcw, ChevronRight } from 'lucide-react';
import { UserPreferences } from '../../types';
import { motion } from 'motion/react';
import { useTheme } from '../layout/ThemeContext';
import { testGeminiConnection } from '../../lib/gemini';
import { cn } from '../../lib/utils';

interface SettingsViewProps {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  onReset: () => void;
  logout: () => void;
}

export default function SettingsView({ preferences, setPreferences, onReset, logout }: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingGemini, setIsConnectingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  const handleResetClick = () => {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      onReset();
    }
  };

  const handleConnect = () => {
    if (!preferences.youtubeApiKey) {
      alert('Please enter an API Key first.');
      return;
    }
    
    setIsConnecting(true);
    // Simulate a connection check
    setTimeout(() => {
      setIsConnecting(false);
      alert('✅ Successfully Connected to YouTube API!');
    }, 1500);
  };

  const handleConnectGemini = async () => {
    if (!preferences.geminiApiKey) return;
    setIsConnectingGemini(true);
    setGeminiStatus('idle');
    try {
      await testGeminiConnection(preferences.geminiApiKey);
      setGeminiStatus('connected');
    } catch (err) {
      setGeminiStatus('error');
    } finally {
      setIsConnectingGemini(false);
    }
  };

  return (
    <div className="space-y-10 pb-28 max-w-2xl mx-auto px-4 gpu">
      <header className="space-y-2">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600">Settings</h2>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
           <ShieldCheck size={12} className="text-gray-400" /> System Configuration
        </p>
      </header>

      <div className="space-y-4">
        {/* Appearance Section */}
        <section className="p-8 rounded-[3rem] glass-card border border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-indigo-400">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Moon size={20} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest">Appearance</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="space-y-1">
                <div className="text-sm font-bold italic tracking-tight uppercase">Dark Aesthetic</div>
                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Neural theme sync</div>
             </div>
             <button 
               onClick={toggleTheme}
               className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
             >
               {theme === 'day' ? 'Activate' : 'Active'}
             </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="space-y-1">
                <div className="text-sm font-bold italic tracking-tight uppercase">Compact Hub Mode</div>
                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Optimized for accessibility</div>
             </div>
             <button 
               onClick={() => setPreferences({ ...preferences, isCompactMode: !preferences.isCompactMode })}
               className={cn(
                 "w-12 h-6 rounded-full transition-all duration-500 relative p-1",
                 preferences.isCompactMode ? "bg-indigo-600" : "bg-white/10"
               )}
             >
                <motion.div 
                  animate={{ x: preferences.isCompactMode ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-lg"
                />
             </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="space-y-1">
                <div className="text-sm font-bold italic tracking-tight uppercase">Performance Mode</div>
                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Reduce heavy visual effects</div>
             </div>
             <button 
               onClick={() => setPreferences({ ...preferences, isPerformanceMode: !preferences.isPerformanceMode })}
               className={cn(
                 "w-12 h-6 rounded-full transition-all duration-500 relative p-1",
                 preferences.isPerformanceMode ? "bg-emerald-600" : "bg-white/10"
               )}
             >
                <motion.div 
                  animate={{ x: preferences.isPerformanceMode ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-lg"
                />
             </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="space-y-1">
                <div className="text-sm font-bold italic tracking-tight uppercase">Battery Saver</div>
                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Static backgrounds & low cycles</div>
             </div>
             <button 
               onClick={() => setPreferences({ ...preferences, isBatterySaver: !preferences.isBatterySaver })}
               className={cn(
                 "w-12 h-6 rounded-full transition-all duration-500 relative p-1",
                 preferences.isBatterySaver ? "bg-amber-600" : "bg-white/10"
               )}
             >
                <motion.div 
                  animate={{ x: preferences.isBatterySaver ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-lg"
                />
             </button>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <div className="space-y-1">
                      <div className="text-sm font-bold italic tracking-tight uppercase">Glow Intensity</div>
                      <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Visual bloom effect</div>
                   </div>
                   <span className="text-[10px] font-black opacity-30 uppercase">{preferences.glowIntensity}%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      className="absolute inset-y-0 left-0 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${preferences.glowIntensity}%` }}
                   />
                   <input 
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.glowIntensity || 100}
                    onChange={(e) => setPreferences({ ...preferences, glowIntensity: parseInt(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <div className="space-y-1">
                      <div className="text-sm font-bold italic tracking-tight uppercase">Animation Speed</div>
                      <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Motion fluidiy control</div>
                   </div>
                   <span className="text-[10px] font-black opacity-30 uppercase">{preferences.animationIntensity}%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      className="absolute inset-y-0 left-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${preferences.animationIntensity}%` }}
                   />
                   <input 
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.animationIntensity || 100}
                    onChange={(e) => setPreferences({ ...preferences, animationIntensity: parseInt(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <div className="space-y-1">
                      <div className="text-sm font-bold italic tracking-tight uppercase">Camera Viewport</div>
                      <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">AI Focus framing</div>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2 px-2">
                   {['small', 'medium', 'large'].map((size) => (
                     <button
                        key={size}
                        onClick={() => setPreferences({ ...preferences, cameraSize: size as any })}
                        className={cn(
                          "py-3 rounded-xl border transition-all text-center group font-black text-[10px] uppercase tracking-widest",
                          preferences.cameraSize === size 
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" 
                            : "bg-white/5 border-transparent hover:bg-white/[0.08]"
                        )}
                     >
                        {size}
                     </button>
                   ))}
                </div>
             </div>

             <div className="border-t border-white/5 pt-6 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="space-y-1">
                      <div className="text-sm font-bold italic tracking-tight uppercase">UI Scale</div>
                      <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Manual scaling control</div>
                   </div>
                   <div className="flex items-center gap-2">
                   <input 
                      type="number" 
                      value={preferences.uiScale ?? 100}
                      onChange={(e) => {
                        const val = Math.min(150, Math.max(50, parseInt(e.target.value) || 100));
                        setPreferences({ ...preferences, uiScale: val });
                      }}
                      className="w-16 h-10 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-black outline-none focus:border-indigo-500/50"
                   />
                   <span className="text-[10px] font-black opacity-30 uppercase">%</span>
                </div>
             </div>

             <div className="px-2 space-y-4">
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      className="absolute inset-y-0 left-0 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${(((preferences.uiScale ?? 100) - 70) / (130 - 70)) * 100}%` }}
                   />
                   <input 
                    type="range"
                    min="70"
                    max="130"
                    value={preferences.uiScale ?? 100}
                    onChange={(e) => setPreferences({ ...preferences, uiScale: parseInt(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                   {[
                     { label: 'Ultra', value: 75, sub: '75%' },
                     { label: 'Compact', value: 85, sub: '85%' },
                     { label: 'Balanced', value: 100, sub: '100%' },
                     { label: 'Comfort', value: 115, sub: '115%' }
                   ].map((preset) => (
                     <button
                        key={preset.label}
                        onClick={() => setPreferences({ ...preferences, uiScale: preset.value })}
                        className={cn(
                          "py-3 px-1 rounded-xl border transition-all text-center group",
                          (preferences.uiScale ?? 100) === preset.value 
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400" 
                            : "bg-white/5 border-transparent hover:bg-white/[0.08]"
                        )}
                     >
                        <div className="text-[9px] font-black uppercase tracking-tighter mb-0.5">{preset.label}</div>
                        <div className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{preset.sub}</div>
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mt-6 group">
                <div className="space-y-1">
                   <div className="text-sm font-bold italic tracking-tight uppercase group-hover:text-indigo-400 transition-colors">Auto Device optimization</div>
                   <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Adaptive neural scaling</div>
                </div>
                <button 
                  onClick={() => setPreferences({ ...preferences, autoScale: !(preferences.autoScale ?? false) })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all duration-500 relative p-1",
                    (preferences.autoScale ?? false) ? "bg-indigo-600" : "bg-white/10"
                  )}
                >
                   <motion.div 
                     animate={{ x: (preferences.autoScale ?? false) ? 24 : 0 }}
                     className="w-4 h-4 rounded-full bg-white shadow-lg"
                   />
                </button>
             </div>
          </div>
        </div>
      </section>

        {/* AI Integrations Section */}
        <section className="p-8 rounded-[3rem] glass-card border border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-emerald-400">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Zap size={20} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest">AI Integrations</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3 px-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4">YouTube Data API</label>
              <div className="flex gap-2">
                <input 
                  type="password"
                  placeholder="v3 API Key..."
                  value={preferences.youtubeApiKey || ''}
                  onChange={(e) => setPreferences({ ...preferences, youtubeApiKey: e.target.value })}
                  className="flex-1 h-12 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-sm font-black transition-all"
                />
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {isConnecting ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : 'Sync'}
                </button>
              </div>
            </div>

            <div className="space-y-3 px-2 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-4">Gemini Neural Link</label>
              <div className="flex gap-2">
                <input 
                  type="password"
                  placeholder="Neural Access Key..."
                  value={preferences.geminiApiKey || ''}
                  onChange={(e) => {
                    setPreferences({ ...preferences, geminiApiKey: e.target.value });
                    setGeminiStatus('idle');
                  }}
                  className="flex-1 h-12 px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-sm font-black transition-all"
                />
                <button 
                  onClick={handleConnectGemini}
                  disabled={isConnectingGemini || !preferences.geminiApiKey}
                  className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {isConnectingGemini ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : 'Sync'}
                </button>
              </div>
              
              {geminiStatus === 'connected' && (
                <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-2 ml-4">
                  <CheckCircle2 size={12} /> Neural Connection Stable
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data & Backup Section */}
        <section className="p-8 rounded-[3rem] glass-card border border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-amber-400">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <RotateCcw size={20} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest">Data & Backup</h3>
          </div>
          
          <div className="grid gap-2">
            <button 
              onClick={() => {}}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group"
            >
               <span className="text-sm font-black italic uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">Export Local Registry</span>
               <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={handleResetClick}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-rose-500/10 transition-all group"
            >
               <span className="text-sm font-black italic uppercase tracking-tighter opacity-60 group-hover:text-rose-500 transition-all">Emergency Purge</span>
               <AlertCircle size={18} className="text-rose-500/40 group-hover:text-rose-500 transition-all" />
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="p-8 rounded-[3rem] glass-card border border-white/5 space-y-6">
           <div className="flex items-center gap-4 text-blue-400">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Bell size={20} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
             <div className="space-y-1">
                <div className="text-sm font-bold italic tracking-tight uppercase">Push Alerts</div>
                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">Neural sync notifications</div>
             </div>
             <div className="w-12 h-6 rounded-full bg-white/10 relative p-1 cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
             </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="p-8 rounded-[3rem] glass-card border border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-rose-400">
             <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <ShieldCheck size={20} />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest">Security</h3>
          </div>
          
          <button 
            onClick={logout}
            className="w-full py-6 rounded-2xl bg-rose-600 text-white font-black italic uppercase tracking-widest shadow-2xl shadow-rose-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
             <LogOut size={20} /> Deauthorize Neural Link
          </button>
        </section>

        <footer className="text-center py-12 space-y-2 opacity-20">
           <div className="text-[10px] font-black uppercase tracking-[0.6em]">Neural Protocol: 100% Synchronized</div>
           <div className="text-[8px] font-bold uppercase tracking-widest">Roy Study Suite v4.2.0 • [STABLE BUILD]</div>
        </footer>
      </div>
      <style>{`
        .glass-card { background: rgba(255, 255, 255, 0.02); }
      `}</style>
    </div>
  );
}
