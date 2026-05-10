export interface User {
  id: string;
  name: string;
  mobile: string;
  passcode: string;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface VideoNote {
  id: string;
  videoId: string;
  timestamp: number;
  timeLabel: string;
  text: string;
}

export interface VideoPlaylist {
  id: string;
  name: string;
  subject: string;
  videos: YouTubeVideo[];
}

export interface WatchHistory {
  videoId: string;
  lastTimestamp: number;
  totalDurationAtLastSave: number;
  playbackRate: number;
  updatedAt: number;
}

export interface HistoryItem extends YouTubeVideo {
  progress?: WatchHistory;
}

export interface StudySession {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: 'study' | 'break' | 'rest';
  color: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  isPinned?: boolean;
}

export interface AnalyticsData {
  date: string; // YYYY-MM-DD
  hours: number;
  sessions: number;
  tasksCompleted: number;
  lecturesWatched: number;
  focusScore: number; // 0-100
  intensityMinutes: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // For generic heatmap usage
  level: 0 | 1 | 2 | 3; // 0: none, 1: low, 2: med, 3: high
}

export interface SubjectStats {
  name: string;
  minutesStudied: number;
  tasksDone: number;
  lastStudied: number;
}

export interface PredictionStats {
  completionPercentage: number;
  estimatedCompletionDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface UserPreferences {
  theme: 'day' | 'night';
  mode: 'day-study' | 'night-study';
  lofiVolume: number;
  ambienceVolume: number;
  activeAmbience: 'none' | 'rain' | 'forest' | 'white-noise';
  pomodoroWork: number;
  pomodoroBreak: number;
  youtubeApiKey?: string;
  startTime?: string;
  endTime?: string;
}

export interface TimerState {
  isActive: boolean;
  mode: 'work' | 'break';
  startTime: number | null; // timestamp when started
  duration: number; // in seconds
  remainingAtLastPause: number;
}
