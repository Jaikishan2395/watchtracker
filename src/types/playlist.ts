
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
  solved: boolean;
  timeSpent?: number; // in minutes
  notes?: string;
  tags?: string[];
  dateAdded: string;
  dateSolved?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'coding'; // New field to distinguish playlist types
  videos: Video[];
  codingQuestions?: CodingQuestion[]; // New field for coding questions
  createdAt: string;
  deadline?: string;
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
}
