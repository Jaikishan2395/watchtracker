import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, Code, Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Heart, MessageSquare, Share, BookmarkCheck, TrendingDown, ArrowUp, ArrowDown, Calendar, BarChart, Flame, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from '@/components/StatsCard';
import { PlaylistData, Playlist, Video } from '@/types/playlist';
import { BarChart as ReBarChart, Bar as ReBar, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import NewProgressTabs from '@/components/NewProgressTabs';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
  // Add userStats calculation (copy from Profile)
  const [userStats, setUserStats] = useState({
    daysActive: 0,
    hoursLearning: 0,
    problemsSolved: 0,
    tasksCompleted: 0,
    joinDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString().split('T')[0]
  });

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

  useEffect(() => {
    // Calculate userStats from playlists (copy logic from Profile)
    let joinDate = localStorage.getItem('userJoinDate');
    if (!joinDate) {
      joinDate = new Date().toISOString();
      try { localStorage.setItem('userJoinDate', joinDate); } catch (e) { /* ignore localStorage error */ }
    }
    let lastActivityDate = localStorage.getItem('lastActivityDate');
    if (!lastActivityDate) {
      lastActivityDate = new Date().toISOString().split('T')[0];
      try { localStorage.setItem('lastActivityDate', lastActivityDate); } catch (e) { /* ignore localStorage error */ }
    }
    const today = new Date().toISOString().split('T')[0];
    const isActiveToday = lastActivityDate === today;
    let currentStreak = 0;
    let longestStreak = 0;
    let hoursLearning = 0;
    let completedVideos = 0;
    let totalVideos = 0;
    if (Array.isArray(playlists) && playlists.length > 0) {
      try {
        const totalMinutes = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.reduce((playlistTotal, video) => {
            if (!video.watchTime || !video.progress) return playlistTotal;
            return playlistTotal + (video.watchTime * (video.progress || 0) / 100);
          }, 0);
        }, 0);
        hoursLearning = Math.round(totalMinutes / 60 * 10) / 10;
        completedVideos = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.filter(video => video.progress >= 100).length;
        }, 0);
        totalVideos = playlists.reduce((total, playlist) => {
          if (!playlist.videos) return total;
          return total + playlist.videos.length;
        }, 0);
        playlists.forEach(playlist => {
          if (playlist.streakData) {
            currentStreak = Math.max(currentStreak, playlist.streakData.currentStreak || 0);
            longestStreak = Math.max(longestStreak, playlist.streakData.longestStreak || 0);
          }
        });
      } catch (e) { /* ignore playlist stats error */ }
    }
    const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)));
    if (isActiveToday) {
      currentStreak = Math.max(currentStreak, 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastActivityDate === yesterdayStr) {
        currentStreak = Math.max(currentStreak, 1);
      } else {
        currentStreak = 0;
      }
    }
    setUserStats({
      daysActive,
      hoursLearning,
      problemsSolved: completedVideos,
      tasksCompleted: completedVideos,
      joinDate,
      currentStreak,
      longestStreak,
      lastActivityDate
    });
  }, [playlists]);

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

  // --- Breaks Taken Card (Placeholder) ---
  // For now, use a static value or session-based value
  const breaksTaken = 5; // Placeholder, replace with persistent value if available
  const breakDuration = 5; // minutes, placeholder
  const totalBreakTime = breaksTaken * breakDuration;

  // --- Pomodoro Break Sessions Data ---
  type PomodoroSession = { id: string; date: string; duration: number; completedPomodoros: number; taskName: string; category: string; };
  let pomodoroSessions: PomodoroSession[] = [];
  try {
    const saved = localStorage.getItem('pomodoroSessions');
    if (saved) pomodoroSessions = JSON.parse(saved);
  } catch (e) {
    // Failed to parse pomodoroSessions from localStorage
    console.error('Failed to parse pomodoroSessions from localStorage', e);
  }

  // Only count sessions as breaks if duration is 5 or 15 (short/long break)
  const breakDurations = [5, 15];
  const breakSessions = pomodoroSessions.filter(s => breakDurations.includes(s.duration));

  // Aggregation state
  const [breakAgg, setBreakAgg] = useState<'day' | 'week' | 'month'>('day');

  // Helper to get start of week (Monday)
  function getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Aggregate break sessions
  let breakData: { label: string; count: number }[] = [];
  if (breakAgg === 'day') {
    const now = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    breakData = days.map(date => ({
      label: date,
      count: breakSessions.filter(s => s.date.slice(0, 10) === date).length
    }));
  } else if (breakAgg === 'week') {
    // Last 12 weeks
    const now = new Date();
    const weeks: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const weekStart = getWeekStart(d).toISOString().slice(0, 10);
      weeks.push(weekStart);
    }
    breakData = weeks.map(weekStart => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return {
        label: `${weekStart} - ${weekEnd.toISOString().slice(0, 10)}`,
        count: breakSessions.filter(s => {
          const d = new Date(s.date);
          return d >= new Date(weekStart) && d <= weekEnd;
        }).length
      };
    });
  } else if (breakAgg === 'month') {
    // Last 12 months
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    breakData = months.map(month => ({
      label: month,
      count: breakSessions.filter(s => s.date.slice(0, 7) === month).length
    }));
  }

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
        {/* Active Day Card at the top, centered and compact */}
        <div className="flex justify-center mb-6">
          <Card className="relative overflow-hidden bg-white/80 rounded-2xl animate-fade-in w-full max-w-xs">
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-gray-100">
                    <Calendar className="w-6 h-6 text-gray-700" />
                  </div>
                  {userStats.currentStreak >= 3 && (
                    <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold animate-pulse">
                      <Flame className="w-4 h-4 text-gray-700" /> {userStats.currentStreak}d streak
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center mb-2">
                <svg width="90" height="90" viewBox="0 0 90 90" className="block">
                  <circle cx="45" cy="45" r="40" fill="none" stroke="#e0e7ef" strokeWidth="8" />
                  <circle
                    cx="45" cy="45" r="40" fill="none"
                    stroke="url(#active-gradient)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(1, userStats.daysActive / 30))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)' }}
                  />
                  <defs>
                    <linearGradient id="active-gradient" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-black">
                    {userStats.daysActive}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Days</span>
                </div>
              </div>
              <div className="w-full text-center mt-2">
                <span className="text-sm font-semibold text-black">
                  {userStats.currentStreak >= 7
                    ? '🔥 Amazing! You have a week-long streak!'
                    : userStats.currentStreak >= 3
                      ? 'Keep your streak alive!'
                      : userStats.daysActive >= 3
                        ? 'Great start! Stay consistent.'
                        : 'Start your learning streak today!'}
                </span>
              </div>
              <div className="w-full flex flex-col items-center mt-2 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
                    <Flame className="w-7 h-7 blink-red" />
                  </span>
                  <span className="text-3xl font-extrabold text-black ml-2">{userStats.currentStreak}</span>
                  <span className="text-base text-gray-500 font-medium ml-1">day streak</span>
                  <span className="ml-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer text-gray-400">
                          <Info className="w-4 h-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>Current streak: consecutive days you have been active. Keep it going for rewards!</span>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-400">Longest streak:</span>
                  <span className="text-base font-semibold text-black">{userStats.longestStreak} days</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 w-full">
                {[...Array(7)].map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  const dateStr = date.toISOString().split('T')[0];
                  const isActive = userStats.lastActivityDate === dateStr;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <div 
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <div 
                        className={`w-full h-8 rounded-lg transition-all duration-300 flex items-center justify-center relative
                          ${isActive 
                            ? 'bg-gradient-to-b from-blue-500/30 to-indigo-500/30 border border-blue-500/40'
                            : 'bg-gray-200/50'
                          } ${isToday ? 'ring-2 ring-blue-500/40' : ''}`}
                      >
                        {isActive && <Flame className="w-4 h-4 text-orange-400 animate-pulse absolute left-1 top-1" />}
                      </div>
                      <span className={`text-[10px] text-gray-400 ${isToday ? 'font-medium text-black' : ''}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Activity Heatmap below the card */}
        <div className="mb-8">
          <ActivityHeatmap playlists={playlists} />
        </div>
        
        
        {/* Stats Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Video Content Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          {/* New Breaks Card */}
          <StatsCard
            title="Breaks Taken"
            value={`${breaksTaken} (${totalBreakTime} min)`}
            icon={Calendar}
            color="orange"
            delay="500"
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
                <ReResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={playlistChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <ReXAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                    <ReYAxis />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReBar dataKey="Time Spent (min)" fill={COLORS[0]} />
                    <ReBar dataKey="Content Watched" fill={COLORS[1]} />
                  </ReBarChart>
                </ReResponsiveContainer>
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
            <ReResponsiveContainer width="100%" height={220}>
              <ReBarChart data={hoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <ReXAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
                <ReYAxis allowDecimals={false} />
                <ReTooltip formatter={v => `${v} activities`} />
                <ReBar dataKey="count" fill="#3b82f6" />
              </ReBarChart>
            </ReResponsiveContainer>
          </CardContent>
        </Card>

        {/* New Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-6 h-6" />
                Break Sessions ({breakAgg === 'day' ? 'Per Day (30d)' : breakAgg === 'week' ? 'Per Week (12w)' : 'Per Month (12m)'})
              </CardTitle>
              <CardDescription>
                Number of Pomodoro break sessions per {breakAgg}.
              </CardDescription>
              <div className="mt-2">
                <Select value={breakAgg} onValueChange={v => setBreakAgg(v as 'day' | 'week' | 'month')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Per Day (30d)</SelectItem>
                    <SelectItem value="week">Per Week (12w)</SelectItem>
                    <SelectItem value="month">Per Month (12m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ReResponsiveContainer width="100%" height={220}>
                <ReBarChart data={breakData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <ReXAxis dataKey="label" tickFormatter={l => breakAgg === 'day' ? l.slice(5) : l} interval={breakAgg === 'day' ? 4 : 0} />
                  <ReYAxis allowDecimals={false} />
                  <ReTooltip formatter={v => `${v} sessions`} />
                  <ReBar dataKey="count" fill="#f43f5e" />
                </ReBarChart>
              </ReResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
