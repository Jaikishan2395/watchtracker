import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, Code, Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Heart, MessageSquare, Share, BookmarkCheck, TrendingDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from '@/components/StatsCard';
import { PlaylistData, Playlist } from '@/types/playlist';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import NewProgressTabs from '@/components/NewProgressTabs';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: {
        type: 'video' | 'coding';
    }
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const type = payload[0].payload.type;
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{type} Playlist</p>
        {payload.map((pld, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
            <p className="text-slate-600 dark:text-slate-400">{`${pld.name}:`}</p>
            <p className="font-medium text-slate-700 dark:text-slate-300">{pld.value}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

  const playlistChartData = playlists.map(playlist => {
    let timeSpent = 0;
    let contentWatched = 0;

    if (playlist.type === 'video' && playlist.videos) {
      timeSpent = playlist.videos.reduce((sum, v) => sum + (v.watchTime || 0), 0);
      contentWatched = playlist.videos.filter(v => v.progress >= 100).length;
    } else if (playlist.type === 'coding' && playlist.codingQuestions) {
      timeSpent = playlist.codingQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
      contentWatched = playlist.codingQuestions.filter(q => q.solved).length;
    }

    return {
      name: playlist.title,
      'Time Spent (min)': timeSpent,
      'Content Watched': contentWatched,
      type: playlist.type,
    };
  }).filter(item => item['Time Spent (min)'] > 0 || item['Content Watched'] > 0);

  const COLORS = ['#8884d8', '#82ca9d'];

  const progressData = [
    { name: 'Videos', completed: stats.completedVideos, total: stats.totalVideos },
    { name: 'Coding', completed: stats.solvedQuestions, total: stats.totalCodingQuestions }
  ];

  const pieData = [
    { name: 'Completed', value: stats.completedVideos + stats.solvedQuestions, color: '#10b981' },
    { name: 'Remaining', value: (stats.totalVideos - stats.completedVideos) + (stats.totalCodingQuestions - stats.solvedQuestions), color: '#e5e7eb' }
  ];

  // --- Most Productive Hours Data ---
  const hoursData = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  playlists.forEach(playlist => {
    if (playlist.type === 'video' && playlist.videos) {
      playlist.videos.forEach(v => {
        if (v.completedAt) {
          const d = new Date(v.completedAt);
          hoursData[d.getHours()].count++;
        }
      });
    } else if (playlist.type === 'coding' && playlist.codingQuestions) {
      playlist.codingQuestions.forEach(q => {
        if (q.dateSolved) {
          const d = new Date(q.dateSolved);
          hoursData[d.getHours()].count++;
        }
      });
    }
  });

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

        <Card className="mb-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Playlist Stats
            </CardTitle>
            <CardDescription>Breakdown of time spent and content watched for each playlist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="hide-scrollbar"
            >
              <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
              `}</style>
              <div style={{ minWidth: Math.max(playlistChartData.length * 120, 400) }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playlistChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Time Spent (min)" fill={COLORS[0]} />
                    <Bar dataKey="Content Watched" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Most Productive Hours
            </CardTitle>
            <CardDescription>When you are most active (videos watched or problems solved).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={v => `${v} activities`} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Charts */}
        <div className="mb-8">
          {playlists.length > 0 ? (
            <NewProgressTabs playlists={playlists} />
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
