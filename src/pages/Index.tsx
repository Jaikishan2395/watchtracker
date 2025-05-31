import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, Code, Share2, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Eye, Heart, MessageSquare, Share, BookmarkCheck, TrendingDown, ArrowUp, ArrowDown, Calendar, Instagram } from 'lucide-react';
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

const Index = () => {
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
  
  // Social media data for different platforms
  const [socialMediaData, setSocialMediaData] = useState({
    youtube: [
      { date: '2024-01', watchTime: 120, likes: 45, dislikes: 2, comments: 8, saves: 12 },
      { date: '2024-02', watchTime: 150, likes: 52, dislikes: 3, comments: 10, saves: 15 },
      { date: '2024-03', watchTime: 180, likes: 60, dislikes: 4, comments: 15, saves: 18 },
      { date: '2024-04', watchTime: 200, likes: 75, dislikes: 5, comments: 18, saves: 20 },
      { date: '2024-05', watchTime: 250, likes: 90, dislikes: 6, comments: 22, saves: 25 }
    ],
    instagram: [
      { date: '2024-01', likes: 120, comments: 15, saves: 25, shares: 8 },
      { date: '2024-02', likes: 150, comments: 18, saves: 30, shares: 10 },
      { date: '2024-03', likes: 180, comments: 22, saves: 35, shares: 12 },
      { date: '2024-04', likes: 200, comments: 25, saves: 40, shares: 15 },
      { date: '2024-05', likes: 250, comments: 30, saves: 45, shares: 18 }
    ],
    twitter: [
      { date: '2024-01', likes: 85, retweets: 25, replies: 12, bookmarks: 15 },
      { date: '2024-02', likes: 95, retweets: 30, replies: 15, bookmarks: 18 },
      { date: '2024-03', likes: 110, retweets: 35, replies: 18, bookmarks: 20 },
      { date: '2024-04', likes: 125, retweets: 40, replies: 20, bookmarks: 22 },
      { date: '2024-05', likes: 150, retweets: 45, replies: 25, bookmarks: 25 }
    ]
  });

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const parsedPlaylists = JSON.parse(savedPlaylists) as Playlist[];
      setPlaylists(parsedPlaylists);
      calculateStats(parsedPlaylists);
    }
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
        {(stats.totalVideos > 0 || stats.totalCodingQuestions > 0) && (
          <>
            {/* Progress Over Time */}
            <div className="mb-8">
              <ProgressTabs playlists={playlists} />
            </div>
          </>
        )}

        {/* Social Media Activity Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Social Media Activity</h2>
              <p className="text-gray-500 mt-1">Track your engagement across different platforms</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select defaultValue="5m">
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="5m">Last 5 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full md:w-auto">
                <TrendingUp className="w-4 h-4 mr-2" />
                Compare Periods
              </Button>
            </div>
          </div>

          <Card className="bg-white/70 dark:bg-slate-900/90 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-sm bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                  Last Updated: {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="youtube" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl shadow-sm border border-gray-200/50 dark:border-slate-700/50">
                  <TabsTrigger 
                    value="youtube" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5 py-1.5">
                      <img src="https://www.youtube.com/favicon.ico" alt="YouTube" className="w-5 h-5" />
                      <span className="font-medium">YouTube</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instagram" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5 py-1.5">
                      <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      <span className="font-medium">Instagram</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="twitter" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5 py-1.5">
                      <img src="https://twitter.com/favicon.ico" alt="Twitter" className="w-5 h-5" />
                      <span className="font-medium">Twitter</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="youtube">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Watch Time</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                                {socialMediaData.youtube[socialMediaData.youtube.length - 1].watchTime}m
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                12%
                              </span>
                            </div>
                            <Progress value={75} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">Likes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                                {socialMediaData.youtube[socialMediaData.youtube.length - 1].likes}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                8%
                              </span>
                            </div>
                            <Progress value={85} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <ThumbsDown className="w-4 h-4" />
                              <span className="text-sm">Dislikes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-red-500 dark:text-red-400">
                                {socialMediaData.youtube[socialMediaData.youtube.length - 1].dislikes}
                              </p>
                              <span className="text-red-500 dark:text-red-400 text-sm flex items-center">
                                <ArrowDown className="w-3 h-3 mr-1" />
                                3%
                              </span>
                            </div>
                            <Progress value={65} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Comments</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {socialMediaData.youtube[socialMediaData.youtube.length - 1].comments}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                10%
                              </span>
                            </div>
                            <Progress value={80} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Bookmark className="w-4 h-4" />
                              <span className="text-sm">Saves</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                                {socialMediaData.youtube[socialMediaData.youtube.length - 1].saves}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                15%
                              </span>
                            </div>
                            <Progress value={90} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 animate-fade-in border border-gray-200/50 dark:border-slate-700/50">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">YouTube Engagement Metrics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Track your video performance and audience interaction over time</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={socialMediaData.youtube}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                          <XAxis dataKey="date" className="text-sm text-gray-600 dark:text-slate-400" />
                          <YAxis className="text-sm text-gray-600 dark:text-slate-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              color: '#1f2937'
                            }}
                          />
                          <Line type="monotone" dataKey="watchTime" stroke="#ef4444" name="Watch Time (min)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="likes" stroke="#22c55e" name="Likes" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="dislikes" stroke="#f43f5e" name="Dislikes" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="comments" stroke="#8b5cf6" name="Comments" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="saves" stroke="#eab308" name="Saves" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instagram">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">Likes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-pink-600 dark:text-pink-400">
                                {socialMediaData.instagram[socialMediaData.instagram.length - 1].likes}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                8%
                              </span>
                            </div>
                            <Progress value={85} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Comments</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {socialMediaData.instagram[socialMediaData.instagram.length - 1].comments}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                10%
                              </span>
                            </div>
                            <Progress value={90} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Bookmark className="w-4 h-4" />
                              <span className="text-sm">Saves</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                                {socialMediaData.instagram[socialMediaData.instagram.length - 1].saves}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                15%
                              </span>
                            </div>
                            <Progress value={95} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Share className="w-4 h-4" />
                              <span className="text-sm">Shares</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                                {socialMediaData.instagram[socialMediaData.instagram.length - 1].shares}
                              </p>
                              <span className="text-green-500 dark:text-emerald-400 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                20%
                              </span>
                            </div>
                            <Progress value={100} className="mt-2 h-1 bg-gray-200 dark:bg-slate-700" />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 animate-fade-in border border-gray-200/50 dark:border-slate-700/50">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Instagram Engagement Metrics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Monitor your post performance and audience interaction trends</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={socialMediaData.instagram}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                          <XAxis dataKey="date" className="text-sm text-gray-600 dark:text-slate-400" />
                          <YAxis className="text-sm text-gray-600 dark:text-slate-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              color: '#1f2937'
                            }}
                          />
                          <Line type="monotone" dataKey="likes" stroke="#E1306C" name="Likes" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="comments" stroke="#405DE6" name="Comments" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="saves" stroke="#833AB4" name="Saves" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="shares" stroke="#FD1D1D" name="Shares" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="twitter">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">Likes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400">
                                {socialMediaData.twitter[socialMediaData.twitter.length - 1].likes}
                              </p>
                              <span className="text-red-500 text-sm flex items-center">
                                <ArrowDown className="w-3 h-3 mr-1" />
                                3%
                              </span>
                            </div>
                            <Progress value={65} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <Share className="w-4 h-4" />
                              <span className="text-sm">Retweets</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                                {socialMediaData.twitter[socialMediaData.twitter.length - 1].retweets}
                              </p>
                              <span className="text-green-500 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                10%
                              </span>
                            </div>
                            <Progress value={90} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Replies</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                                {socialMediaData.twitter[socialMediaData.twitter.length - 1].replies}
                              </p>
                              <span className="text-green-500 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                15%
                              </span>
                            </div>
                            <Progress value={80} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <Card className="bg-white/50 dark:bg-slate-800/50 border-0 hover:shadow-md transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-800/70">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                              <BookmarkCheck className="w-4 h-4" />
                              <span className="text-sm">Bookmarks</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                                {socialMediaData.twitter[socialMediaData.twitter.length - 1].bookmarks}
                              </p>
                              <span className="text-green-500 text-sm flex items-center">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                20%
                              </span>
                            </div>
                            <Progress value={100} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 animate-fade-in border border-gray-200/50 dark:border-slate-700/50">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Twitter Engagement Metrics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Track your tweet performance and audience engagement patterns</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={socialMediaData.twitter}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                          <XAxis dataKey="date" className="text-sm text-gray-600 dark:text-slate-400" />
                          <YAxis className="text-sm text-gray-600 dark:text-slate-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              color: '#1f2937'
                            }}
                          />
                          <Line type="monotone" dataKey="likes" stroke="#1DA1F2" name="Likes" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="retweets" stroke="#17BF63" name="Retweets" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="replies" stroke="#794BC4" name="Replies" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="bookmarks" stroke="#FFAD1F" name="Bookmarks" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
