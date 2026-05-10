import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Moon, 
  Sun, 
  BrainCircuit,
  Settings2,
  ListTodo,
  StickyNote,
  BarChart3,
  Music,
  Headphones,
  Maximize2,
  Trophy,
  PartyPopper,
  Play, 
  MoreVertical, 
  X, 
  Trophy as TrophyIcon, 
  Mail, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Zap, 
  ChevronRight, 
  Brain,
  Sparkles,
  Target,
  Monitor,
  RotateCcw
} from 'lucide-react';
import { useTheme } from './components/layout/ThemeContext';
import { useTimer } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { StudySession, Task, Note, AnalyticsData, UserPreferences, YouTubeVideo, WatchHistory, UserStats } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useAuth } from './context/AuthContext';

// Components
import FocusMode from './components/features/FocusMode';
import AIPlanner from './components/features/AIPlanner';
import Timetable from './components/features/Timetable';
import TasksNotes from './components/features/TasksNotes';
import Analytics from './components/features/Analytics';
import AudioPlayer from './components/features/AudioPlayer';
import AuthScreens from './components/auth/AuthScreens';
import YouTubeStudy from './components/features/YouTubeStudy';
import SettingsView from './components/features/SettingsView';
import AILab from './components/features/AILab';
import DailyMissions from './components/features/DailyMissions';
import XPLevels from './components/features/XPLevels';
import StudyAvatarView from './components/features/StudyAvatar';
import FocusRoom from './components/features/FocusRoom';
import AIRevisionMaster from './components/features/AIRevisionMaster';
import AIHub from './components/features/AIHub';
import SmartStudyAnalyzer from './components/features/SmartStudyAnalyzer';
import AIFocusShield from './components/features/AIFocusShield';
import AIRevisionEngine from './components/features/AIRevisionEngine';
import AIExamWarRoom from './components/features/AIExamWarRoom';
import AILifeBalancer from './components/features/AILifeBalancer';
import AIStudyCompanion from './components/features/AIStudyCompanion';
import CompanionFloatingWidget from './components/ui/CompanionFloatingWidget';
import AIMemoryPalace from './components/features/AIMemoryPalace';
import AIRealityMode from './components/features/AIRealityMode';
import RealityFX from './components/ui/RealityFX';
import AISecondBrain from './components/features/AISecondBrain';
import AITimeMachine from './components/features/AITimeMachine';
import AIDisciplineEngine from './components/features/AIDisciplineEngine';
import AIKnowledgeArena from './components/features/AIKnowledgeArena';
import AIDreamTracker from './components/features/AIDreamTracker';
import AIMockTestGenerator from './components/features/AIMockTestGenerator';
import AIMistakeNotebook from './components/features/AIMistakeNotebook';
import AIFormulaVault from './components/features/AIFormulaVault';
import AISmartRoutine from './components/features/AISmartRoutine';
import AITopicPredictor from './components/features/AITopicPredictor';
import AIFocusPet from './components/features/AIFocusPet';
import AILiveLeaderboard from './components/features/AILiveLeaderboard';
import AIStudyLock from './components/features/AIStudyLock';
import AISmartWallpaper from './components/features/AISmartWallpaper';
import BackgroundEngine from './components/BackgroundEngine';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusRoomOpen, setIsFocusRoomOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState<{ title: string, text: string } | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [showXPPopup, setShowXPPopup] = useState<{ xp: number, reason: string } | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<{ level: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('study-tasks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('study-notes', []);
  const [analytics, setAnalytics] = useLocalStorage<AnalyticsData[]>('study-analytics', []);
  const [userStats, setUserStats] = useLocalStorage<UserStats>('user-stats', {
    xp: 0,
    level: 1,
    streak: 0
  });

  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('user-preferences', {
    theme: 'day',
    mode: 'day-study',
    lofiVolume: 50,
    ambienceVolume: 50,
    activeAmbience: 'none',
    pomodoroWork: 25,
    pomodoroBreak: 5,
    uiScale: 100,
    autoScale: false
  });

  // Global Scale Sync
  useEffect(() => {
    const scale = (preferences.uiScale || 100) / 100;
    document.documentElement.style.fontSize = `${16 * scale}px`;
    
    const handleResize = () => {
      if (preferences.autoScale) {
        let newScale = 100;
        if (window.innerWidth < 400) newScale = 85;
        else if (window.innerWidth > 1200) newScale = 110;
        else newScale = 100;

        if (newScale !== (preferences.uiScale || 100)) {
          setPreferences(prev => ({ ...prev, uiScale: newScale }));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [preferences.uiScale, preferences.autoScale, setPreferences]);
  
  const { timeLeft, isActive, start, pause, resume, reset } = useTimer(preferences.pomodoroWork * 60);

  const handleXPGain = useCallback((amount: number, reason: string) => {
    setUserStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      if (newLevel > prev.level) {
        setShowLevelUp({ level: newLevel });
        setTimeout(() => setShowLevelUp(null), 5000);
      }
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
    setShowXPPopup({ xp: amount, reason });
    setTimeout(() => setShowXPPopup(null), 3000);
  }, [setUserStats]);

  // Helper to update daily analytics
  const updateDailyAnalytics = useCallback((update: Partial<AnalyticsData>) => {
    const today = new Date().toISOString().split('T')[0];
    setAnalytics(prev => {
      const existing = prev.find(d => d.date === today);
      if (existing) {
        return prev.map(d => {
          if (d.date === today) {
            const newIntensity = d.intensityMinutes + (update.intensityMinutes || 0);
            return {
              ...d,
              ...update,
              sessions: d.sessions + (update.sessions || 0),
              tasksCompleted: d.tasksCompleted + (update.tasksCompleted || 0),
              lecturesWatched: d.lecturesWatched + (update.lecturesWatched || 0),
              intensityMinutes: newIntensity,
              hours: Number((newIntensity / 60).toFixed(1)),
              focusScore: Math.min(100, (d.focusScore || 0) + (update.focusScore || 0))
            };
          }
          return d;
        });
      }
      const initialIntensity = update.intensityMinutes || 0;
      return [...prev, {
        date: today,
        hours: Number((initialIntensity / 60).toFixed(1)),
        sessions: update.sessions || 0,
        tasksCompleted: update.tasksCompleted || 0,
        lecturesWatched: update.lecturesWatched || 0,
        focusScore: update.focusScore || 0,
        intensityMinutes: initialIntensity,
      }];
    });
  }, [setAnalytics]);

  // Track session completion
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      updateDailyAnalytics({ 
        sessions: 1, 
        intensityMinutes: preferences.pomodoroWork,
        focusScore: 10
      });
      handleXPGain(15, "Session Completed");
      setShowAchievement({ title: "Session Complete!", text: "You just gained +10 focus points 🔥" });
      setTimeout(() => setShowAchievement(null), 5000);
    }
  }, [timeLeft === 0, isActive]);

  // Fullscreen Focus Mode toggle
  const enterFocus = () => setIsFullscreen(true);
  const exitFocus = () => setIsFullscreen(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFullscreen]);

  const navigate = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleReset = () => {
    setSessions([]);
    setTasks([]);
    setNotes([]);
    setAnalytics([]);
    localStorage.removeItem('study-timer-state');
    reset(preferences.pomodoroWork * 60);
  };

  const [history] = useLocalStorage<YouTubeVideo[]>('study-video-history', []);
  const [videoProgress] = useLocalStorage<Record<string, WatchHistory>>('study-video-progress', {});

  const lastWatchedVideo = useMemo(() => {
    if (history.length === 0) return null;
    const last = history[0];
    const progress = videoProgress[last.id];
    if (!progress) return { ...last, percent: 0 };
    const percent = progress.totalDurationAtLastSave ? (progress.lastTimestamp / progress.totalDurationAtLastSave) * 100 : 0;
    return { ...last, percent };
  }, [history, videoProgress]);

  const handleAvatarXP = useCallback((xp: number, reason: string) => {
    handleXPGain(xp, reason);
    setShowAchievement({ 
      title: "Quest Completed!", 
      text: `You earned +${xp} XP from your Avatar Quest! 🔥` 
    });
    setTimeout(() => setShowAchievement(null), 5000);
  }, [handleXPGain]);

  if (isAppLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-[#0a0a0a]", theme)}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-indigo-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
            <BrainCircuit size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-white">Roy Study</h1>
            <div className="w-24 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
               <motion.div 
                 className="h-full bg-indigo-500" 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 0.8 }}
               />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthScreens />;

  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-500 overflow-x-hidden relative", theme)}>
      <BackgroundEngine />
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSidebarOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 bottom-0 w-80 bg-[#0a0a0a] border-l border-white/5 z-[210] p-8 shadow-2xl flex flex-col"
            >
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Menu</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-white/5 rounded-2xl">
                     <X size={20} />
                  </button>
               </div>

               <div className="flex-1 space-y-2">
                  <SidebarItem 
                    icon={<Sun size={20} className="text-amber-400" />} 
                    label="Theme Mode" 
                    sub="Switch light/dark"
                    onClick={() => { toggleTheme(); setIsSidebarOpen(false); }}
                  />
                  <SidebarItem 
                    icon={<Zap size={20} className="text-indigo-400" />} 
                    label="API Connections" 
                    sub="Neural key status"
                    onClick={() => { navigate('settings'); setIsSidebarOpen(false); }}
                  />
                  <SidebarItem 
                    icon={<RotateCcw size={20} className="text-emerald-400" />} 
                    label="Backup & Restore" 
                    sub="Secure your data"
                    onClick={() => { navigate('settings'); setIsSidebarOpen(false); }}
                  />
                  <SidebarItem 
                    icon={<Shield size={20} className="text-rose-400" />} 
                    label="Security" 
                    sub="Privacy & encryption"
                    onClick={() => { navigate('settings'); setIsSidebarOpen(false); }}
                  />
                  <SidebarItem 
                    icon={<Mail size={20} className="text-blue-400" />} 
                    label="Help & Feedback" 
                    sub="Support guide"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                  <SidebarItem 
                    icon={<Sparkles size={20} className="text-purple-400" />} 
                    label="App Info" 
                    sub="v4.2.0-STABLE"
                    onClick={() => setIsSidebarOpen(false)}
                  />
               </div>

               <button 
                onClick={() => { logout(); setIsSidebarOpen(false); }}
                className="mt-auto p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
               >
                 <LogOut size={18} /> Logout Session
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="p-12 rounded-[4rem] bg-indigo-600 text-white shadow-2xl text-center space-y-6 max-w-sm border border-white/20 relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center shadow-inner relative">
                   <PartyPopper size={56} className="text-yellow-400" />
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
                   />
                </div>
                <div className="space-y-2">
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter">Level Up!</h3>
                   <div className="text-xl font-bold opacity-60 uppercase tracking-widest">You reached Level {showLevelUp.level}</div>
                </div>
                <p className="text-sm font-medium opacity-80 italic">"Your persistence is paying off. You are evolving into a study beast."</p>
                <button 
                  onClick={() => setShowLevelUp(null)}
                  className="w-full py-5 rounded-[2rem] bg-white text-indigo-600 font-black uppercase tracking-widest shadow-xl"
                >
                  Continue Journey
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showXPPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-indigo-500 text-white shadow-2xl flex items-center gap-3 border border-white/20"
          >
             <Zap size={18} fill="currentColor" className="text-yellow-400" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{showXPPopup.reason}</span>
                <span className="text-sm font-black tracking-tighter">+{showXPPopup.xp} XP EARNED</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFocusRoomOpen && (
          <FocusRoom 
            timeLeft={timeLeft} 
            isActive={isActive} 
            onPause={pause} 
            onResume={resume} 
            onReset={() => reset(preferences.pomodoroWork * 60)}
            onExit={() => setIsFocusRoomOpen(false)}
            onXPGain={handleAvatarXP}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && (
          <FocusMode 
            timeLeft={timeLeft} 
            isActive={isActive} 
            onPause={pause} 
            onResume={resume} 
            onReset={() => reset(preferences.pomodoroWork * 60)}
            onExit={exitFocus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievement && (
          <motion.div 
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 20, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className="fixed top-0 left-1/2 z-[200] p-4 rounded-3xl bg-indigo-600 text-white shadow-2xl flex items-center gap-4 border border-white/20 min-w-[300px]"
          >
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Trophy size={24} />
             </div>
             <div>
                <h4 className="font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                   {showAchievement.title} <PartyPopper size={14} />
                </h4>
                <p className="text-xs opacity-80">{showAchievement.text}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-24 pt-6 px-4 max-w-lg mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        <header className="flex justify-between items-center mb-8 px-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roy Study</h1>
            <p className="text-xs opacity-60 font-medium uppercase tracking-widest mt-1">Productivity Suite</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-2xl glass hover:scale-105 transition-transform"
            >
              {theme === 'day' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={enterFocus}
              className="p-3 rounded-2xl glass hover:scale-105 transition-transform text-indigo-500"
            >
              <Maximize2 size={20} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl glass hover:scale-105 transition-transform"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* AI Hub Quick Access */}
              <button 
                onClick={() => navigate('hub')}
                className="w-full p-6 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between group shadow-xl shadow-indigo-600/20 overflow-hidden relative"
              >
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                 <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                       <BrainCircuit size={24} />
                    </div>
                    <div className="text-left">
                       <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Neural Gateway</div>
                       <div className="text-xl font-black italic uppercase tracking-tighter">Enter AI Hub</div>
                    </div>
                 </div>
                 <ChevronRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform opacity-40" />
              </button>

              {lastWatchedVideo && lastWatchedVideo.percent < 98 && (
                <section className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Play className="text-red-500" size={14} /> Continue</h3>
                    <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Smart Resume</span>
                  </div>
                  <button 
                    onClick={() => navigate('youtube')}
                    className="w-full relative group overflow-hidden rounded-[1.5rem] glass border border-white/5 p-3 flex gap-4 text-left hover:bg-white/[0.08] transition-all"
                  >
                     <div className="w-28 aspect-video rounded-xl overflow-hidden shrink-0 relative shadow-lg">
                        <img src={lastWatchedVideo.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                             <Play size={14} fill="currentColor" />
                          </div>
                        </div>
                        {lastWatchedVideo.percent > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                            <motion.div 
                              className="h-full bg-indigo-500" 
                              initial={{ width: 0 }}
                              animate={{ width: `${lastWatchedVideo.percent}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        )}
                     </div>
                     <div className="flex flex-col justify-center py-0.5 flex-1 min-w-0">
                        <h4 className="text-xs font-bold leading-tight line-clamp-1 mb-0.5 uppercase tracking-tight">{lastWatchedVideo.title}</h4>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2">{lastWatchedVideo.channelTitle}</p>
                        <div className="flex items-center gap-2">
                           <div className="text-[8px] font-black py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-400 uppercase">
                              {Math.floor(lastWatchedVideo.percent)}% Done
                           </div>
                        </div>
                     </div>
                  </button>
                </section>
              )}

              <section className="p-5 rounded-[2rem] glass relative overflow-hidden group">
                <div className="relative z-10 text-center">
                   <div className="flex justify-between items-center mb-2 px-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40">Focus Session</span>
                      <BrainCircuit size={14} className="text-indigo-500" />
                   </div>
                   <div className="text-5xl font-black tabular-nums tracking-tighter mb-4">
                     {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                   </div>
                   <div className="flex gap-3 px-2">
                      {isActive ? (
                        <button onClick={pause} className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20">Pause</button>
                      ) : (
                        <button onClick={() => start(1500)} className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20">Start</button>
                      )}
                      <button onClick={() => reset(1500)} className="w-12 h-12 rounded-2xl glass flex items-center justify-center shrink-0">
                        <Settings2 size={18} />
                      </button>
                   </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('planner')} className="p-4 rounded-3xl glass text-left space-y-2 group transition-all duration-300 hover:bg-white/[0.08]">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <BrainCircuit size={16} />
                  </div>
                  <div className="font-bold text-sm tracking-tight italic uppercase">Planner</div>
                </button>
                <button onClick={() => navigate('timetable')} className="p-4 rounded-3xl glass text-left space-y-2 group transition-all duration-300 hover:bg-white/[0.08]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Calendar size={16} />
                  </div>
                  <div className="font-bold text-sm tracking-tight italic uppercase">Schedule</div>
                </button>
              </div>

              <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold flex items-center gap-2"><ListTodo size={18} /> Today's Goals</h3>
                  <button onClick={() => navigate('tasks')} className="text-xs font-semibold text-indigo-500">View All</button>
                </div>
                <div className="space-y-3">
                   {tasks.slice(0, 3).map(task => (
                     <div key={task.id} className="p-4 rounded-2xl glass flex items-center gap-3">
                        <input type="checkbox" checked={task.completed} onChange={() => {}} className="w-5 h-5 rounded-lg accent-indigo-500" />
                        <span className={cn(task.completed && "line-through opacity-50")}>{task.text}</span>
                     </div>
                   ))}
                   {tasks.length === 0 && (
                     <div className="p-8 text-center glass rounded-2xl opacity-50 text-sm">No tasks added yet.</div>
                   )}
                </div>
              </section>
              
              <AudioPlayer />
            </div>
          )}

          {activeTab === 'hub' && (
            <AIHub 
              userStats={userStats} 
              onNavigate={(tab) => {
                if (tab === 'focus-room') setIsFocusRoomOpen(true);
                else navigate(tab);
              }} 
            />
          )}

          {activeTab === 'analyzer' && (
            <SmartStudyAnalyzer 
              apiKey={preferences.geminiApiKey}
              stats={userStats}
              analytics={analytics}
              tasks={tasks}
              sessions={sessions}
            />
          )}
          
          {activeTab === 'revision_engine' && (
            <AIRevisionEngine apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'war_room' && (
            <AIExamWarRoom 
              apiKey={preferences.geminiApiKey}
              stats={userStats}
              analytics={analytics}
              tasks={tasks}
            />
          )}

          {activeTab === 'life_balancer' && (
            <AILifeBalancer 
              apiKey={preferences.geminiApiKey}
              analytics={analytics}
              sessions={sessions}
            />
          )}

          {activeTab === 'companion' && (
            <AIStudyCompanion />
          )}

          {activeTab === 'memory_palace' && (
            <AIMemoryPalace apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'reality_mode' && (
            <AIRealityMode />
          )}

          {activeTab === 'second_brain' && (
            <AISecondBrain apiKey={preferences.geminiApiKey} />
          )}
          
          {activeTab === 'time_machine' && (
            <AITimeMachine apiKey={preferences.geminiApiKey} analytics={analytics} />
          )}

          {activeTab === 'discipline_engine' && (
            <AIDisciplineEngine apiKey={preferences.geminiApiKey} analytics={analytics} />
          )}

          {activeTab === 'knowledge_arena' && (
            <AIKnowledgeArena apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'dream_tracker' && (
            <AIDreamTracker apiKey={preferences.geminiApiKey} analytics={analytics} />
          )}

          {activeTab === 'mock_test' && (
            <AIMockTestGenerator apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'mistake_notebook' && (
            <AIMistakeNotebook apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'formula_vault' && (
            <AIFormulaVault apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'smart_routine' && (
            <AISmartRoutine apiKey={preferences.geminiApiKey} />
          )}
          
          {activeTab === 'topic_predictor' && (
            <AITopicPredictor apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'focus_pet' && (
            <AIFocusPet apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'leaderboard' && (
            <AILiveLeaderboard apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'study_lock' && (
            <AIStudyLock apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'smart_wallpaper' && (
            <AISmartWallpaper apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'shield' && (
            <AIFocusShield 
              onScoreUpdate={(score) => {
                setUserStats(prev => ({ 
                  ...prev, 
                  xp: prev.xp + Math.floor(score / 2),
                  focusScore: score 
                }));
              }}
            />
          )}

          {activeTab === 'planner' && <AIPlanner sessions={sessions} setSessions={setSessions} geminiApiKey={preferences.geminiApiKey} />}
          {activeTab === 'timetable' && <Timetable sessions={sessions} />}
          {activeTab === 'lab' && <AILab geminiApiKey={preferences.geminiApiKey} theme={theme} />}
          {activeTab === 'revision' && <AIRevisionMaster apiKey={preferences.geminiApiKey} onXPGain={handleAvatarXP} />}
          {activeTab === 'xplevels' && <XPLevels stats={userStats} analytics={analytics} />}
          {activeTab === 'avatar' && (
            <StudyAvatarView 
              stats={userStats} 
              analytics={analytics} 
              onXPGain={handleAvatarXP}
            />
          )}
          {activeTab === 'missions' && <DailyMissions apiKey={preferences.geminiApiKey} onXPGain={(xp, reason) => {
            handleXPGain(xp, reason);
            setShowAchievement({ title: "Mission XP Gained!", text: `You earned +${xp} experience points! 🔥` });
            setTimeout(() => setShowAchievement(null), 3000);
          }} />}
          {activeTab === 'tasks' && (
            <TasksNotes 
              tasks={tasks} 
              setTasks={setTasks} 
              notes={notes} 
              setNotes={setNotes} 
              geminiApiKey={preferences.geminiApiKey}
              onTaskComplete={() => {
                updateDailyAnalytics({ tasksCompleted: 1, focusScore: 5 });
                handleXPGain(10, "Task Mastered");
                setShowAchievement({ title: "Task Accomplished!", text: "Keep going! +10 focus points." });
                setTimeout(() => setShowAchievement(null), 3000);
              }}
            />
          )}
          {activeTab === 'analytics' && <Analytics data={analytics} tasks={tasks} sessions={sessions} />}
          {activeTab === 'youtube' && (
            <YouTubeStudy 
              apiKey={preferences.youtubeApiKey || ''} 
              timeLeft={timeLeft} 
              onResume={resume}
              onPause={pause}
              timerActive={isActive}
              onLectureStart={() => {
                updateDailyAnalytics({ lecturesWatched: 1, focusScore: 5 });
                handleXPGain(5, "Learning Started");
                setShowAchievement({ title: "Lecture Started!", text: "Learning is power. +5 XP earned." });
                setTimeout(() => setShowAchievement(null), 3000);
              }}
            />
          )}
          {activeTab === 'settings' && <SettingsView preferences={preferences} setPreferences={setPreferences} onReset={handleReset} logout={logout} />}
        </main>

        <CompanionFloatingWidget apiKey={preferences.geminiApiKey} analytics={analytics} />
        <RealityFX />

        <nav className="fixed bottom-4 left-4 right-4 h-16 bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2rem] border border-white/5 flex items-center justify-between px-6 z-[90] shadow-2xl">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'youtube', icon: Headphones, label: 'Focus' },
            { id: 'hub', icon: BrainCircuit, label: 'AI Hub' },
            { id: 'analytics', icon: BarChart3, label: 'Stats' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                activeTab === item.id ? "text-indigo-400 scale-110" : "opacity-30 hover:opacity-100"
              )}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {activeTab === item.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                />
              )}
              <span className={cn("text-[7px] font-black uppercase tracking-widest mt-0.5", activeTab === item.id ? "opacity-100" : "opacity-0")}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

const StatCard = memo(({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="p-6 rounded-[2rem] glass-light space-y-2 border border-white/5 gpu"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div>
        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{label}</div>
        <div className="text-[9px] opacity-30 font-medium">{sub}</div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

const SidebarItem = memo(({ icon, label, sub, onClick, active }: { icon: any, label: string, sub: string, onClick: () => void, active?: boolean }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-3.5 rounded-[1.5rem] flex items-center gap-4 transition-all group tap-highlight-none gpu",
        active ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-white/5 border border-transparent active:scale-[0.98]"
      )}
    >
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {icon}
       </div>
       <div className="text-left">
          <div className="text-sm font-black italic uppercase tracking-tighter">{label}</div>
          <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{sub}</div>
       </div>
       <ChevronRight size={16} className="ml-auto opacity-20 group-active:opacity-100 transition-opacity" />
    </button>
  );
});

SidebarItem.displayName = 'SidebarItem';
