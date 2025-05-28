export interface Video {
  id: string;
  title: string;
  url: string;
  scheduledTime?: string; // ISO date string for scheduled time
  progress: number; // percentage 0-100
  watchTime: number; // total watch time in seconds
  thumbnail?: string;
  dateCompleted?: string; // ISO date string when video was completed
  contentType?: 'course' | 'tutorial' | 'lecture' | 'workshop' | 'interview' | 'documentary' | 'conference' | 'webinar' | 'podcast' | 'coding-tutorial' | 'project-walkthrough' | 'tech-talk' | 'other'; // Type of video content
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
  contentType?: 'course' | 'tutorial' | 'lecture' | 'workshop' | 'interview' | 'documentary' | 'conference' | 'webinar' | 'podcast' | 'coding-tutorial' | 'project-walkthrough' | 'tech-talk' | 'other'; // Type of content in the playlist
  videos: Video[];
  codingQuestions?: CodingQuestion[];
  createdAt: string;
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
  questionsThisWeek: number;
  averageTimePerQuestion: number;
  categoryProgress: { [key: string]: { solved: number; total: number } };
}
