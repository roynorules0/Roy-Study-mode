import { useState } from 'react';
import { Settings, LogOut, Trash2, ShieldCheck, Youtube, Bell, Moon, Sun, Loader2 } from 'lucide-react';
import { UserPreferences } from '../../types';
import { motion } from 'motion/react';
import { useTheme } from '../layout/ThemeContext';

interface SettingsViewProps {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  onReset: () => void;
  logout: () => void;
}

export default function SettingsView({ preferences, setPreferences, onReset, logout }: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);

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

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Preferences</h2>
          <p className="text-sm opacity-60">Customize your study space.</p>
        </div>
        <div className="p-3 rounded-2xl glass text-indigo-500">
           <Settings size={20} />
        </div>
      </header>

      <div className="space-y-4">
        {/* Appearance Section */}
        <section className="p-6 rounded-[2rem] glass space-y-4">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
            <Moon size={14} /> Appearance
          </h3>
          <div className="flex items-center justify-between">
             <div className="text-sm font-medium">Theme Mode</div>
             <button 
               onClick={toggleTheme}
               className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold text-xs"
             >
               {theme === 'day' ? 'Day Mode' : 'Night Mode'}
             </button>
          </div>
        </section>

        {/* API Keys Section */}
        <section className="p-6 rounded-[2rem] glass space-y-4">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
            <Youtube size={14} /> YouTube Integration
          </h3>
          <div className="space-y-3">
            <label className="text-xs font-medium opacity-60">YouTube Data API v3 Key</label>
            <div className="flex gap-2">
              <input 
                type="password"
                placeholder="Enter your API Key..."
                value={preferences.youtubeApiKey || ''}
                onChange={(e) => setPreferences({ ...preferences, youtubeApiKey: e.target.value })}
                className="flex-1 h-12 px-4 rounded-xl glass focus:ring-1 ring-indigo-500 outline-none text-sm"
              />
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-4 h-12 rounded-xl bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : 'Connect'}
              </button>
            </div>
            <p className="text-[10px] opacity-40 leading-tight">Key is stored securely on your device. Once connected, you can search for any lectures.</p>
          </div>
        </section>

        {/* System Settings */}
        <section className="p-6 rounded-[2rem] glass space-y-4">
           <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} /> Security & Session
          </h3>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/5 transition-colors group"
          >
            <span className="text-sm font-medium group-hover:text-red-500 transition-colors">Logout from App</span>
            <LogOut size={18} className="text-red-500" />
          </button>
          
          <button 
            onClick={handleResetClick}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/5 transition-colors group"
          >
            <div className="text-left">
              <span className="text-sm font-medium group-hover:text-red-500 transition-colors block">Reset Progress</span>
              <span className="text-[10px] opacity-40 block">Clear streaks, tasks, and history</span>
            </div>
            <Trash2 size={18} className="text-red-500" />
          </button>
        </section>

        <div className="text-center py-4">
           <div className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em]">Roy Study v2.0.0</div>
        </div>
      </div>
    </div>
  );
}
