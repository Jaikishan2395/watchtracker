import { useState, useEffect } from 'react';
import { Plus, Clock, Target, TrendingUp, Play, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import AddPlaylistModal from '@/components/AddPlaylistModal';
import StatsCard from '@/components/StatsCard';
import StreakTracker from '@/components/StreakTracker';
import { Playlist, PlaylistData } from '@/types/playlist';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CodingProgressDashboard from '@/components/CodingProgressDashboard';

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<PlaylistData>({
    totalWatchTime: 0,
    totalVideos: 0,
    completedVideos: 0,
    overallProgress: 0,
    estimatedCompletion: '',
    dailyAverage: 0,
    totalCodingQuestions: 0,
    solvedQuestions: 0,
    currentStreak: 0,
    longestStreak: 0,
    questionsThisWeek: 0,
    averageTimePerQuestion: 0,
    categoryProgress: {}
  });

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const parsedPlaylists = JSON.parse(savedPlaylists);
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
      playlist.videos.forEach(video => {
        totalWatchTime += video.duration;
        totalVideos++;
        if (video.progress >= 100) {
          completedVideos++;
        }
        totalProgress += video.progress;
      });

      if (playlist.codingQuestions) {
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
          if (!categoryProgress[q.category]) {
            categoryProgress[q.category] = { solved: 0, total: 0 };
          }
          categoryProgress[q.category].total++;
          if (q.solved) {
            categoryProgress[q.category].solved++;
          }
        });
      }
    });

    const overallProgress = totalVideos > 0 ? totalProgress / totalVideos : 0;
    const dailyAverage = 45;
    const remainingTime = totalWatchTime * (1 - overallProgress / 100);
    const estimatedDays = Math.ceil(remainingTime / dailyAverage);
    
    // Calculate streaks (simplified)
    const currentStreak = Math.floor(Math.random() * 15) + 1; // Placeholder
    const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 25) + 5);
    
    setStats({
      totalWatchTime,
      totalVideos,
      completedVideos,
      overallProgress,
      estimatedCompletion: `${estimatedDays} days`,
      dailyAverage,
      totalCodingQuestions,
      solvedQuestions,
      currentStreak,
      longestStreak,
      questionsThisWeek,
      averageTimePerQuestion: solvedQuestions > 0 ? totalTimePerQuestion / solvedQuestions : 0,
      categoryProgress
    });
  };

  const addPlaylist = (playlist: Playlist) => {
    const updatedPlaylists = [...playlists, playlist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
    calculateStats(updatedPlaylists);
  };

  const deletePlaylist = (id: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== id);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
    calculateStats(updatedPlaylists);
  };

  const videoPlaylists = playlists.filter(p => p.type === 'video' || !p.type);
  const codingPlaylists = playlists.filter(p => p.type === 'coding');

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
        {/* Enhanced Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Progress Tracker
              </h1>
              <p className="text-gray-600 text-lg">Master coding through videos and practice</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Content"
            value={(stats.totalVideos + stats.totalCodingQuestions).toString()}
            icon={Play}
            color="blue"
            delay="100"
          />
          <StatsCard
            title="Completed"
            value={(stats.completedVideos + stats.solvedQuestions).toString()}
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
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <StreakTracker
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              lastActivityDate={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Coding Progress Dashboard - Show only if there are coding playlists */}
        {codingPlaylists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Coding Progress</h2>
            <CodingProgressDashboard playlists={playlists} />
          </div>
        )}

        {/* Progress Charts */}
        {(stats.totalVideos > 0 || stats.totalCodingQuestions > 0) && (
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
        )}

        {/* Action Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Learning Content</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Playlists with Tabs */}
        {playlists.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="animate-fade-in">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-500 mb-6">Create your first playlist to track videos and coding problems</p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="videos">Video Playlists</TabsTrigger>
              <TabsTrigger value="coding">Coding Practice</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist, index) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={deletePlaylist}
                    delay={index * 100}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoPlaylists.map((playlist, index) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={deletePlaylist}
                    delay={index * 100}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="coding" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {codingPlaylists.map((playlist, index) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={deletePlaylist}
                    delay={index * 100}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <AddPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPlaylist}
        />
      </div>
    </div>
  );
};

export default Index;
