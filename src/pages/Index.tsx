import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import { PlaylistData, Playlist } from '@/types/playlist';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CodingProgressDashboard from '@/components/CodingProgressDashboard';
import ProgressTabs from '@/components/ProgressTabs';

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
        
        // Calculate questions solved this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        questionsThisWeek += playlist.codingQuestions.filter(q => 
          q.solved && q.dateSolved && new Date(q.dateSolved) > oneWeekAgo
        ).length;

        // Calculate average time per question
        const solvedQuestionsWithTime = playlist.codingQuestions.filter(q => q.solved && q.timeSpent);
        totalTimePerQuestion += solvedQuestionsWithTime.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

        // Calculate category progress
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
    const dailyAverage = 45; // This could be calculated based on actual user activity
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
      currentStreak: 0, // These could be calculated from streak data
      longestStreak: 0
    });
  };

  // Chart data
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#10b981" />
                      <Bar dataKey="total" fill="#e5e7eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Progress Over Time */}
            <div className="mb-8">
              <ProgressTabs playlists={playlists} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
