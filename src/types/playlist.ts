
export interface Video {
  id: string;
  title: string;
  url: string;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videos: Video[];
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
}
