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
  CheckCircle2,
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
import EliteModesHub from './components/features/EliteModesHub';
import SmartStudyAnalyzer from './components/features/SmartStudyAnalyzer';
import AIFocusShield from './components/features/AIFocusShield';
import AIRevisionEngine from './components/features/AIRevisionEngine';
import AIExamWarRoom from './components/features/AIExamWarRoom';
import AILifeBalancer from './components/features/AILifeBalancer';
import AIStudyCompanion from './components/features/AIStudyCompanion';
import CompanionFloatingWidget from './components/ui/CompanionFloatingWidget';
import AIMemoryPalace from './components/features/AIMemoryPalace';
import RealityFX from './components/ui/RealityFX';
import SyncStatus from './components/ui/SyncStatus';
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
import AIDeepRevisionEngine from './components/features/AIDeepRevisionEngine';
import AIPYQHunter from './components/features/AIPYQHunter';
import AIVoiceCoach from './components/features/AIVoiceCoach';
import AIMemoryRecallBattle from './components/features/AIMemoryRecallBattle';
import AIStudyDNA from './components/features/AIStudyDNA';
import AITimeFreeze from './components/features/AITimeFreeze';
import AIMindPalace from './components/features/AIMindPalace';
import AIBlackbox from './components/features/AIBlackbox';
import AIDreamCity from './components/features/AIDreamCity';
import AIMultiverseClassroom from './components/features/AIMultiverseClassroom';
import AITitanProtocol from './components/features/AITitanProtocol';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [eliteHubMode, setEliteHubMode] = useState<string | null>(null);
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
    autoScale: false,
    glowIntensity: 100,
    animationIntensity: 100,
    isCompactMode: false,
    isPerformanceMode: false,
    isBatterySaver: false,
    cameraSize: 'medium'
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
  
  const { timeLeft, isActive, start, pause, resume, reset, syncTime } = useTimer(preferences.pomodoroWork * 60);

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
      <SyncStatus />
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

        <main className="pb-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Main Focus Control */}
              <section className="p-10 rounded-[3.5rem] glass-card border border-white/5 relative overflow-hidden group bg-white/[0.01] shadow-2xl">
                <div className="relative z-10 text-center space-y-6">
                   <div className="flex justify-between items-center px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">System Core</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">v9.2 PRO</span>
                   </div>
                   
                   <div className="text-[7rem] leading-none font-black tabular-nums tracking-tighter py-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20 drop-shadow-2xl">
                     {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                   </div>

                   <div className="flex gap-4 px-2">
                      {isActive ? (
                        <button onClick={pause} className="flex-[2] py-6 rounded-[2rem] bg-white text-black font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all">Pause</button>
                      ) : (
                        <button onClick={() => start(preferences.pomodoroWork * 60)} className="flex-[2] py-6 rounded-[2rem] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">Start Session</button>
                      )}
                      <button onClick={() => reset(preferences.pomodoroWork * 60)} className="w-20 h-20 rounded-[2rem] glass border border-white/10 flex items-center justify-center shrink-0 active:scale-95 transition-all">
                        <RotateCcw size={20} className="opacity-40" />
                      </button>
                   </div>
                </div>
              </section>

              {/* Quick Navigation / Missions */}
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => setActiveTab('missions')}
                  className="p-6 rounded-[2.5rem] bg-indigo-500 text-white flex flex-col justify-between h-40 relative overflow-hidden group shadow-xl shadow-indigo-500/20"
                 >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                       <Zap size={64} fill="white" />
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-[0.3em] opacity-60">Daily Directive</div>
                    <div className="space-y-1">
                       <div className="text-xl font-black italic uppercase tracking-tighter">Missions</div>
                       <div className="flex items-center gap-1.5 opacity-60">
                          <CheckCircle2 size={10} />
                          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Tap to track</span>
                       </div>
                    </div>
                 </button>

                 <button 
                  onClick={() => setActiveTab('planner')}
                  className="p-6 rounded-[2.5rem] glass-card border border-white/5 flex flex-col justify-between h-40 group hover:border-emerald-500/30 transition-all"
                 >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                       <Calendar size={20} />
                    </div>
                    <div className="space-y-1">
                       <div className="text-sm font-black italic uppercase tracking-tighter">AI Planner</div>
                       <div className="text-[7px] font-black opacity-30 uppercase tracking-[0.2em]">Neural Schedule</div>
                    </div>
                 </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { label: 'Neural XP', value: userStats.xp, color: 'text-indigo-400' },
                   { label: 'Study Time', value: `${analytics[analytics.length-1]?.hours || 0}h`, color: 'text-emerald-400' },
                   { label: 'Rank', value: `Lv.${userStats.level}`, color: 'text-amber-400' }
                 ].map((stat, i) => (
                   <div key={i} className="p-6 rounded-[2.5rem] glass-card border border-white/5 text-center space-y-1">
                      <div className="text-[7px] font-black uppercase tracking-widest opacity-30">{stat.label}</div>
                      <div className={cn("text-lg font-black italic tracking-tighter", stat.color)}>{stat.value}</div>
                   </div>
                 ))}
              </div>

              {/* Main Hub Entry (Large) */}
              <button 
                onClick={() => navigate('hub')}
                className="w-full p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group relative overflow-hidden active:scale-[0.98] transition-all"
              >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                       <Brain size={32} />
                    </div>
                    <div className="text-left space-y-1">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">System Hub</h3>
                       <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Access All Neural Modules</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="opacity-20 group-hover:translate-x-2 transition-transform" />
              </button>

              <AudioPlayer />
            </div>
          )}

          {activeTab === 'hub' && (
            <AIHub 
              userStats={userStats} 
              isCompactMode={preferences.isCompactMode}
              onNavigate={(tab) => {
                if (tab.startsWith('elite_hub:')) {
                  setEliteHubMode(tab.split(':')[1]);
                  setActiveTab('elite_hub');
                } else if (tab === 'focus-room') {
                  setIsFocusRoomOpen(true);
                } else {
                  navigate(tab);
                }
              }}
            />
          )}

          {activeTab === 'elite_hub' && (
            <EliteModesHub 
              initialMode={eliteHubMode || undefined}
              userStats={userStats}
              onExit={() => {
                setEliteHubMode(null);
                setActiveTab('hub');
              }}
            />
          )}

          {/* Performance & Glow Control Injection */}
          <style>{`
            :root {
              --glow-opacity: ${preferences.isPerformanceMode ? 0.2 : preferences.glowIntensity / 100};
              --anim-speed: ${preferences.isPerformanceMode ? 0.5 : 2 - (preferences.animationIntensity / 50)};
            }
            .glass-card {
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
              backdrop-filter: blur(10px) !important;
            }
            .glow-effect {
              filter: drop-shadow(0 0 calc(10px * var(--glow-opacity)) currentColor);
            }
            * {
              transition-duration: calc(0.3s * var(--anim-speed)) !important;
            }
          `}</style>

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

          {activeTab === 'deep_revision' && (
            <AIDeepRevisionEngine />
          )}

          {activeTab === 'ai_pyq_hunter' && (
            <AIPYQHunter />
          )}
          
          {activeTab === 'ai_voice_coach' && (
            <AIVoiceCoach />
          )}

          {activeTab === 'ai_memory_recall_battle' && (
            <AIMemoryRecallBattle apiKey={preferences.geminiApiKey} />
          )}

          {activeTab === 'ai_study_dna' && (
            <AIStudyDNA />
          )}

          {activeTab === 'ai_time_freeze' && (
            <AITimeFreeze />
          )}

          {activeTab === 'ai_multiverse_classroom' && (
            <AIMultiverseClassroom />
          )}

          {activeTab === 'ai_dream_city' && (
            <AIDreamCity />
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
              syncTime={syncTime}
              timerActive={isActive}
              onLectureStart={() => {
                updateDailyAnalytics({ lecturesWatched: 1, focusScore: 5 });
                handleXPGain(5, "Learning Started");
                setShowAchievement({ title: "Lecture Started!", text: "Learning is power. +5 XP earned." });
                setTimeout(() => setShowAchievement(null), 3000);
              }}
              onMetricsUpdate={(metrics) => {
                if (metrics.sessionComplete) {
                  updateDailyAnalytics({ 
                    lecturesWatched: metrics.lecturesWatched || 1, 
                    focusScore: metrics.focusScore || 20,
                    sessions: 1
                  });
                  if (metrics.focusScore) handleXPGain(metrics.focusScore, "Lecture Completed");
                  setShowAchievement({ title: "Mission Accomplished!", text: "Lecture finished. Session rewards issued. 🔥" });
                  setTimeout(() => setShowAchievement(null), 5000);
                } else {
                  updateDailyAnalytics(metrics);
                }
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
