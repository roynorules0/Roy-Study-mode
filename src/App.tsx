/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Play
} from 'lucide-react';
import { useTheme } from './components/layout/ThemeContext';
import { useTimer } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { StudySession, Task, Note, AnalyticsData, UserPreferences, YouTubeVideo, WatchHistory } from './types';
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

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAchievement, setShowAchievement] = useState<{ title: string, text: string } | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('study-tasks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('study-notes', []);
  const [analytics, setAnalytics] = useLocalStorage<AnalyticsData[]>('study-analytics', []);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('user-preferences', {
    theme: 'day',
    mode: 'day-study',
    lofiVolume: 50,
    ambienceVolume: 50,
    activeAmbience: 'none',
    pomodoroWork: 25,
    pomodoroBreak: 5
  });
  
  const { timeLeft, isActive, start, pause, resume, reset } = useTimer(preferences.pomodoroWork * 60);

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

  const navigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className={cn("min-h-screen font-sans transition-colors duration-500", theme)}>
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
          </div>
        </header>

        <main>
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {lastWatchedVideo && lastWatchedVideo.percent < 98 && (
                <section className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold flex items-center gap-2"><Play className="text-red-500" size={18} /> Continue Watching</h3>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Smart Resume</span>
                  </div>
                  <button 
                    onClick={() => navigate('youtube')}
                    className="w-full relative group overflow-hidden rounded-[2rem] glass border border-white/5 p-4 flex gap-4 text-left hover:bg-white/[0.08] transition-all"
                  >
                     <div className="w-32 aspect-video rounded-2xl overflow-hidden shrink-0 relative shadow-xl">
                        <img src={lastWatchedVideo.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                             <Play size={16} fill="currentColor" />
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
                     <div className="flex flex-col justify-center py-1 flex-1 min-w-0">
                        <h4 className="text-sm font-bold leading-tight line-clamp-1 mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{lastWatchedVideo.title}</h4>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-3">{lastWatchedVideo.channelTitle}</p>
                        <div className="flex items-center gap-2">
                           <div className="text-[9px] font-black py-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-400 uppercase">
                              {Math.floor(lastWatchedVideo.percent)}% Watched
                           </div>
                           <span className="text-[9px] font-bold opacity-30">Resume Now</span>
                        </div>
                     </div>
                  </button>
                </section>
              )}

              <section className="p-6 rounded-[2.5rem] glass relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500" />
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Focus Timer</span>
                      <BrainCircuit size={16} className="text-indigo-500" />
                   </div>
                   <div className="text-6xl font-black tabular-nums tracking-tighter mb-6">
                     {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                   </div>
                   <div className="flex gap-4">
                      {isActive ? (
                        <button onClick={pause} className="flex-1 py-4 rounded-3xl bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30">Pause</button>
                      ) : (
                        <button onClick={() => start(1500)} className="flex-1 py-4 rounded-3xl bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30">Start Session</button>
                      )}
                      <button onClick={() => reset(1500)} className="w-16 h-16 rounded-3xl glass flex items-center justify-center">
                        <Settings2 size={24} />
                      </button>
                   </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('planner')} className="p-6 rounded-[2rem] glass text-left space-y-3 group transition-all duration-300 hover:bg-white/[0.08]">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <BrainCircuit size={20} />
                  </div>
                  <div className="font-bold">AI Planner</div>
                </button>
                <button onClick={() => navigate('timetable')} className="p-6 rounded-[2rem] glass text-left space-y-3 group transition-all duration-300 hover:bg-white/[0.08]">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Calendar size={20} />
                  </div>
                  <div className="font-bold">Schedules</div>
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

          {activeTab === 'planner' && <AIPlanner sessions={sessions} setSessions={setSessions} />}
          {activeTab === 'timetable' && <Timetable sessions={sessions} />}
          {activeTab === 'tasks' && (
            <TasksNotes 
              tasks={tasks} 
              setTasks={setTasks} 
              notes={notes} 
              setNotes={setNotes} 
              onTaskComplete={() => {
                updateDailyAnalytics({ tasksCompleted: 1, focusScore: 5 });
                setShowAchievement({ title: "Task Accomplished!", text: "Keep going! +5 productivity points." });
                setTimeout(() => setShowAchievement(null), 3000);
              }}
            />
          )}
          {activeTab === 'analytics' && <Analytics data={analytics} />}
          {activeTab === 'youtube' && (
            <YouTubeStudy 
              apiKey={preferences.youtubeApiKey || ''} 
              timeLeft={timeLeft} 
              onResume={resume}
              onPause={pause}
              timerActive={isActive}
              onLectureStart={() => {
                updateDailyAnalytics({ lecturesWatched: 1, focusScore: 5 });
                setShowAchievement({ title: "Lecture Started!", text: "Learning is power. Keep it up! +5 focus." });
                setTimeout(() => setShowAchievement(null), 3000);
              }}
            />
          )}
          {activeTab === 'settings' && <SettingsView preferences={preferences} setPreferences={setPreferences} onReset={handleReset} logout={logout} />}
        </main>

        <nav className="fixed bottom-6 left-4 right-4 h-20 glass rounded-[2.5rem] flex items-center justify-around px-4 z-50">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'youtube', icon: Headphones, label: 'Study' },
            { id: 'timetable', icon: Calendar, label: 'Plan' },
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'analytics', icon: BarChart3, label: 'Stats' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                activeTab === item.id ? "text-indigo-500 scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              <item.icon size={22} />
              {activeTab === item.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
