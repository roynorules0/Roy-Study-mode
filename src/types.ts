export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'mcq' | 'revision' | 'lecture' | 'focus' | 'discipline';
  target: number;
  current: number;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface RevisionItem {
  id: string;
  topic: string;
  subject: string;
  summary: string;
  points: string[];
  formulas: string[];
  mnemonics: string[];
  retentionScore: number;
  lastRevised: number;
  nextRevision: number;
  interval: number; // in hours or days for SRS
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastMissionDate?: string;
}

export interface StudyAvatar {
  name: string;
  stage: 'dormant' | 'focused' | 'disciplined' | 'elite' | 'legendary';
  mood: 'happy' | 'focused' | 'sleepy' | 'angry' | 'motivated' | 'burned-out';
  unlockedAccessories: string[];
  activeAccessories: string[];
  disciplineScore: number;
  lastReaction?: string;
  totalXp: number;
  level: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  completed: boolean;
  icon: string;
}

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
  geminiApiKey?: string;
  startTime?: string;
  endTime?: string;
  uiScale: number;
  autoScale: boolean;
}

export interface StudyAnalysis {
  todayReport: string;
  productivityScore: number;
  focusQuality: number;
  disciplineLevel: number;
  weakestSubject: string;
  weakestChapter: string;
  revisionPriority: string[];
  recommendations: string[];
  burnoutRisk: 'low' | 'medium' | 'high';
  examReadiness: number;
  prediction: string;
  hinglishInsight: string;
  lastAnalyzed: number;
}

export interface FocusShieldStats {
  isActive: boolean;
  startTime: number | null;
  distractions: number;
  focusScore: number;
  energyLevel: number;
  lastDistractionTime: number | null;
}

export interface FocusRoomPreferences {
  currentRoom: 'cyber' | 'rain' | 'anime' | 'library' | 'monk' | 'space';
  ambientSounds: {
    rain: number;
    thunder: number;
    cafe: number;
    whiteNoise: number;
    typing: number;
    lofi: number;
  };
  deepWorkMode: boolean;
  unlockedRooms: string[];
}

export interface FocusSessionStats {
  id: string;
  date: string;
  durationMinutes: number;
  room: string;
  focusScore: number;
}

export interface CompanionState {
  personality: 'mentor' | 'friend' | 'senpai' | 'coach' | 'monk' | 'rival';
  mood: 'happy' | 'motivated' | 'serious' | 'calm' | 'concerned';
  lastMessage: string;
  isFloating: boolean;
  energy: number;
}

export interface LifeBalanceData {
  healthScore: number;
  productivityBalance: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  recoveryLevel: number;
  stressLevel: number;
  sleepQuality: number;
  bestSleepTime: string;
  bestWakeTime: string;
  energyPrediction: string;
  hinglishAdvice: string;
  recommendations: string[];
  lastAnalyzed: number;
}

export interface RealityModeState {
  isActive: boolean;
  environment: 'cyber' | 'anime' | 'bunker' | 'library' | 'space';
  intensity: 'calm' | 'focused' | 'ultra' | 'emergency';
  auraLevel: number; // 0-100
  activeMission: {
    id: string;
    text: string;
    progress: number;
    target: number;
  } | null;
  atmosphere: {
    particles: boolean;
    rain: boolean;
    glow: boolean;
  };
}

export interface MemoryPalaceItem {
  id: string;
  topic: string;
  concept: string;
  visualHook: string; // AI generated visual association
  mnemonic: string;
  content: string; // Formula, point, etc.
  strength: number; // 0-100
  lastRecall: number;
}

export interface MemoryRoom {
  id: string;
  name: string;
  subject: string;
  theme: 'lab' | 'arena' | 'vault' | 'hall' | 'monastery';
  items: MemoryPalaceItem[];
}

export interface DisciplineState {
  score: number; // 0-100
  stability: number; // 0-100
  rank: 'Beginner' | 'Focused' | 'Consistent' | 'Elite' | 'Monk Mode' | 'Legendary';
  habits: {
    id: string;
    name: string;
    streak: number;
    completedToday: boolean;
  }[];
  promises: string[];
  lastReview: number;
}

export interface BrainNote {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'formula' | 'concept' | 'idea' | 'doubt';
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  linkedNoteIds: string[];
  summary?: string;
}

export interface TimeMachineData {
  lastSync: number;
  pastMilestones: {
    id: string;
    date: string;
    title: string;
    xp: number;
    type: 'streak' | 'hours' | 'exam' | 'mastery';
  }[];
  projections: {
    syllabusCompletionDays: number;
    readinessScore: number;
    futureConsistency: number; // 0-100 percentage trend
    burnoutRisk: 'low' | 'medium' | 'high';
    estimatedRankImprovement: string;
  };
  futureInsights: string[];
}

export interface ExamWarRoomData {
  isActive: boolean;
  exams: {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
  }[];
  dailyTargets: {
    id: string;
    text: string;
    type: 'mcq' | 'revision' | 'mock' | 'focus';
    target: number;
    current: number;
    completed: boolean;
  }[];
  stamina: number; // 0-100
  combatPower: number; // calculated score
  strategy: string;
  lastAnalysis: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: number;
  nextReview?: number;
  interval: number; // in days
  easeFactor: number;
  reps: number;
  isBookmarked?: boolean;
}

export interface SubjectMastery {
  subject: string;
  masteryScore: number; // 0-100
  retentionRate: number; // 0-100
  accuracyRate: number; // 0-100
  lastRevisionDate: number;
}

export interface DreamGoal {
  id: string;
  title: string;
  targetDate: string;
  category: 'college' | 'rank' | 'lifestyle' | 'personal';
  progress: number; // 0-100
  motivation: string;
}

export interface DreamTrackerState {
  goals: DreamGoal[];
  dreamEnergy: number; // 0-100
  lastSync: number;
  futureInsights: string[];
}

export interface MockQuestion {
  id: string;
  type: 'mcq' | 'assertion-reason' | 'numerical' | 'match';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  mode: 'full' | 'chapter' | 'rapid' | 'pyq' | 'speed';
  questions: MockQuestion[];
  timeLimit: number; // minutes
  totalMarks: number;
}

export interface TestResult {
  testId: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  weakTopics: string[];
  rank: string;
  date: number;
}

export interface MockTestState {
  history: TestResult[];
  activeTest: MockTest | null;
  overallRank: string;
  totalXp: number;
}

export type MistakeCategory = 'conceptual' | 'silly' | 'formula' | 'time' | 'guessing' | 'revision';

export interface Mistake {
  id: string;
  questionId?: string;
  questionText: string;
  subject: string;
  chapter: string;
  category: MistakeCategory;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  frequency: number;
  lastOccurred: number;
  isRecovered: boolean;
}

export interface MistakeState {
  mistakes: Mistake[];
  confidenceScore: number; // 0-100
  lastAnalysis: number;
  hinglishFeedback: string;
}

export interface FormulaItem {
  id: string;
  name: string;
  formula: string;
  subject: 'Physics' | 'Chemistry' | 'Maths' | 'Biology';
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mnemonic?: string;
  isPinned: boolean;
  revisionCount: number;
  lastRevised: number;
}

export interface FormulaVaultState {
  formulas: FormulaItem[];
  lastSync: number;
  aiInsights: string;
}

export interface RoutineSession {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label: string;
  type: 'deep-work' | 'revision' | 'break' | 'mock-test' | 'recovery' | 'personal';
  subject?: string;
  isCompleted: boolean;
}

export type RoutineMode = 'Monk' | 'Balanced' | 'Hardcore' | 'Exam Rush' | 'Recovery';

export interface SmartRoutineState {
  routine: RoutineSession[];
  mode: RoutineMode;
  preferences: {
    wakeUpTime: string;
    sleepTime: string;
    dailyGoals: string[];
    weakSubjects: string[];
  };
  completionRate: number; // 0-100
  disciplineLevel: number; // 0-100
  aiFeedback: string;
  lastAnalysis: number;
}

export interface PredictedTopic {
  id: string;
  name: string;
  subject: string;
  priority: 'Critical' | 'Important' | 'Moderate' | 'Low Priority';
  probability: number; // 0-100
  urgency: number; // 0-100
  reason: string;
  isWeakArea: boolean;
}

export interface TopicPredictorState {
  predictions: PredictedTopic[];
  lastUpdate: number;
  aiInsights: string;
  riskMeter: number; // 0-100
  confidenceHeatmap: { subject: string; score: number }[];
}

export interface FocusPet {
  id: string;
  name: string;
  type: 'fox' | 'panda' | 'cat' | 'owl' | 'dragon';
  stage: 'Baby' | 'Active' | 'Focused' | 'Elite' | 'Legendary';
  xp: number;
  level: number;
  energy: number;
  happiness: number;
  mood: 'Happy' | 'Sleepy' | 'Motivated' | 'Angry' | 'Legendary';
  unlockedSkins: string[];
  activeSkin: string;
  environment: string;
}

export interface FocusPetState {
  activePet: FocusPet | null;
  totalXpCoins: number;
  lastInteraction: number;
  petMessage: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  disciplineScore: number;
  rank: 'Rookie' | 'Challenger' | 'Elite' | 'Titan' | 'Legend' | 'Supreme Focus Master';
  isCurrentUser?: boolean;
}

export interface LeaderboardState {
  users: LeaderboardUser[];
  timeRange: 'daily' | 'weekly' | 'monthly' | 'global';
  lastUpdate: number;
  aiCommentary: string;
}

export interface StudyLockState {
  isActive: boolean;
  startTime: number | null;
  durationMinutes: number;
  goal: string;
  focusScore: number;
  completedSessions: number;
  totalFocusTime: number;
  aiCoaching: string;
}

export interface SmartWallpaperState {
  currentTheme: 'Morning' | 'Cyber Grind' | 'Anime Focus' | 'Deep Space' | 'Elite Exam' | 'Rain Study' | 'Recovery';
  intensity: number; // 0-100
  speed: number; // 0-100
  isBatterySaver: boolean;
  isAutoSwitch: boolean;
  aiReaction: string;
  lastUpdate: number;
}

export interface PlayerPerformanceSettings {
  autoQuality: boolean;
  dataSaver: boolean;
  performanceMode: boolean; // Reduces UI effects when playing
  lowLatency: boolean;
  autoPauseEnabled: boolean;
}

export interface ArenaChallenge {
  id: string;
  type: 'mcq' | 'speed-solve' | 'concept-link';
  subject: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'elite';
  points: number;
}

export interface ArenaState {
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite' | 'Legend';
  division: string; // e.g., "Div-IV"
  prestigePoints: number;
  totalBattles: number;
  winStreak: number;
  subjectMastery: {
    [subject: string]: number; // 0-100
  };
  lastBattleDate: number;
}

export interface TimerState {
  isActive: boolean;
  mode: 'work' | 'break';
  startTime: number | null; // timestamp when started
  duration: number; // in seconds
  remainingAtLastPause: number;
}
