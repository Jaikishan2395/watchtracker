
export interface Video {
  id: string;
  title: string;
  url: string;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  thumbnail?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'algorithms' | 'data-structures' | 'system-design' | 'dynamic-programming' | 'graphs' | 'arrays' | 'strings' | 'trees' | 'other';
  solved: boolean;
  timeSpent?: number; // in minutes
  notes?: string;
  tags?: string[];
  dateAdded: string;
  dateSolved?: string;
  attempts: number;
  lastAttemptDate?: string;
  solutionUrl?: string; // Link to solution code
  difficulty_rating?: number; // User's personal difficulty rating 1-5
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'coding';
  videos: Video[];
  codingQuestions?: CodingQuestion[];
  createdAt: string;
  deadline?: string;
  targetQuestionsPerDay?: number; // For accountability
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    weeklyGoal: number;
    completedThisWeek: number;
  };
}

export interface PlaylistData {
  totalWatchTime: number;
  totalVideos: number;
  completedVideos: number;
  overallProgress: number;
  estimatedCompletion: string;
  dailyAverage: number;
  totalCodingQuestions: number;
  solvedQuestions: number;
  currentStreak: number;
  longestStreak: number;
  questionsThisWeek: number;
  averageTimePerQuestion: number;
  categoryProgress: { [key: string]: { solved: number; total: number } };
}
