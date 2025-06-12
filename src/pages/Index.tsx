import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, Code, Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Heart, MessageSquare, Share, BookmarkCheck, TrendingDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from '@/components/StatsCard';
import { PlaylistData, Playlist } from '@/types/playlist';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import CodingProgressDashboard from '@/components/CodingProgressDashboard';
import ProgressTabs from '@/components/ProgressTabs';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlaylistData>({
    totalWatchTime: 0,
    totalVideos: 0,
    completedVideos: 0,
    overallProgress: 0,
    estimatedCompletion: '',
    dailyAverage: 0,
    totalCodingQuestions: 0,
    solvedQuestions: 0,
    questionsThisWeek: 0,
    averageTimePerQuestion: 0,
    categoryProgress: {},
    currentStreak: 0,
    longestStreak: 0
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        console.log('Loaded playlists from localStorage:', savedPlaylists);
        
        if (savedPlaylists) {
          const parsedPlaylists = JSON.parse(savedPlaylists) as Playlist[];
          console.log('Parsed playlists:', parsedPlaylists);
          setPlaylists(parsedPlaylists);
          calculateStats(parsedPlaylists);
        } else {
          console.log('No saved playlists found, initializing with sample data');
          // Initialize with sample data for testing
          const samplePlaylists: Playlist[] = [
            {
              id: '1',
              title: 'Sample Video Playlist',
              description: 'A sample video playlist',
              type: 'video',
              videos: [
                {
                  id: 'v1',
                  title: 'Video 1',
                  url: 'https://youtube.com/watch?v=1',
                  progress: 100,
                  watchTime: 30,
                  completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 'v2',
                  title: 'Video 2',
                  url: 'https://youtube.com/watch?v=2',
                  progress: 100,
                  watchTime: 45,
                  completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Sample Coding Playlist',
              description: 'A sample coding playlist',
              type: 'coding',
              videos: [], // Required empty array for coding playlist
              codingQuestions: [
                {
                  id: 'q1',
                  title: 'Question 1',
                  description: 'Sample question 1',
                  difficulty: 'easy',
                  category: 'algorithms',
                  solved: true,
                  timeSpent: 30,
                  dateSolved: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  dateAdded: new Date().toISOString(),
                  attempts: 1
                },
                {
                  id: 'q2',
                  title: 'Question 2',
                  description: 'Sample question 2',
                  difficulty: 'medium',
                  category: 'data-structures',
                  solved: true,
                  timeSpent: 45,
                  dateSolved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  dateAdded: new Date().toISOString(),
                  attempts: 2
                }
              ],
              createdAt: new Date().toISOString()
            }
          ];
          console.log('Setting sample playlists:', samplePlaylists);
          setPlaylists(samplePlaylists);
          calculateStats(samplePlaylists);
          localStorage.setItem('youtubePlaylists', JSON.stringify(samplePlaylists));
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        toast.error('Failed to load playlists data');
        setPlaylists([]);
        calculateStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateStats = (playlistsData: Playlist[]) => {
    let totalWatchTime = 0;
    let totalVideos = 0;
    let completedVideos = 0;
    let totalProgress = 0;
    let totalCodingQuestions = 0;
    let solvedQuestions = 0;
    let questionsThisWeek = 0;
    let totalTimePerQuestion = 0;
    const categoryProgress: Record<string, { solved: number; total: number }> = {};

    playlistsData.forEach(playlist => {
      if (Array.isArray(playlist.videos)) {
        playlist.videos.forEach(video => {
          totalWatchTime += video.watchTime || 0;
          totalVideos++;
          if (video.progress >= 100) {
            completedVideos++;
          }
          totalProgress += video.progress;
        });
      }

      if (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)) {
        totalCodingQuestions += playlist.codingQuestions.length;
        solvedQuestions += playlist.codingQuestions.filter(q => q.solved).length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        questionsThisWeek += playlist.codingQuestions.filter(q => 
          q.solved && q.dateSolved && new Date(q.dateSolved) > oneWeekAgo
        ).length;

        const solvedQuestionsWithTime = playlist.codingQuestions.filter(q => q.solved && q.timeSpent);
        totalTimePerQuestion += solvedQuestionsWithTime.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

        playlist.codingQuestions.forEach(q => {
          if (q.category) {
            if (!categoryProgress[q.category]) {
              categoryProgress[q.category] = { solved: 0, total: 0 };
            }
            categoryProgress[q.category].total++;
            if (q.solved) {
              categoryProgress[q.category].solved++;
            }
          }
        });
      }
    });

    const overallProgress = totalVideos > 0 ? totalProgress / totalVideos : 0;
    const dailyAverage = 45;
    const remainingTime = totalWatchTime * (1 - overallProgress / 100);
    const estimatedDays = Math.ceil(remainingTime / dailyAverage);
    
    setStats({
      totalWatchTime,
      totalVideos,
      completedVideos,
      overallProgress,
      estimatedCompletion: `${estimatedDays} days`,
      dailyAverage,
      totalCodingQuestions,
      solvedQuestions,
      questionsThisWeek,
      averageTimePerQuestion: solvedQuestions > 0 ? totalTimePerQuestion / solvedQuestions : 0,
      categoryProgress,
      currentStreak: 0,
      longestStreak: 0
    });
  };

  const progressData = [
    { name: 'Videos', completed: stats.completedVideos, total: stats.totalVideos },
    { name: 'Coding', completed: stats.solvedQuestions, total: stats.totalCodingQuestions }
  ];

  const pieData = [
    { name: 'Completed', value: stats.completedVideos + stats.solvedQuestions, color: '#10b981' },
    { name: 'Remaining', value: (stats.totalVideos - stats.completedVideos) + (stats.totalCodingQuestions - stats.solvedQuestions), color: '#e5e7eb' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Video Content Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Videos"
            value={stats.totalVideos.toString()}
            icon={Play}
            color="blue"
            delay="100"
          />
          <StatsCard
            title="Completed"
            value={stats.completedVideos.toString()}
            icon={Target}
            color="green"
            delay="200"
          />
          <StatsCard
            title="Watch Time"
            value={`${Math.round(stats.totalWatchTime)} min`}
            icon={Clock}
            color="purple"
            delay="300"
          />
          <StatsCard
            title="Progress"
            value={`${Math.round(stats.overallProgress)}%`}
            icon={TrendingUp}
            color="orange"
            delay="400"
          />
        </div>

        {/* Coding Progress Dashboard */}
        {stats.totalCodingQuestions > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Coding Progress</h2>
            <CodingProgressDashboard stats={stats} />
          </div>
        )}

        {/* Progress Charts */}
        <div className="mb-8">
          {playlists.length > 0 ? (
            <ProgressTabs playlists={playlists} />
          ) : (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Play className="w-12 h-12 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Content Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start adding videos and playlists to track your progress</p>
                  <Button variant="outline" className="mt-2">
                    Add Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
