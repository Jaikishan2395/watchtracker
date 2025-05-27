import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Code, CheckCircle, User, Trophy, Target, Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StreakTracker from '@/components/StreakTracker';
import { Playlist, Video } from '@/types/playlist';
import ActivityHeatmap from '@/components/ActivityHeatmap';

interface UserStats {
  daysActive: number;
  hoursLearning: number;
  problemsSolved: number;
  tasksCompleted: number;
  joinDate: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    daysActive: 0,
    hoursLearning: 0,
    problemsSolved: 0,
    tasksCompleted: 0,
    joinDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString().split('T')[0]
  });

  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Calculate stats from localStorage data
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    const joinDate = localStorage.getItem('userJoinDate') || new Date().toISOString();
    const lastActivityDate = localStorage.getItem('lastActivityDate') || new Date().toISOString().split('T')[0];
    
    if (!localStorage.getItem('userJoinDate')) {
      localStorage.setItem('userJoinDate', joinDate);
    }

    // Calculate streaks
    const today = new Date().toISOString().split('T')[0];
    const isActiveToday = lastActivityDate === today;
    let currentStreak = 0;
    let longestStreak = 0;

    if (savedPlaylists) {
      const playlists = JSON.parse(savedPlaylists) as Playlist[];
      setPlaylists(playlists);
      
      // Calculate total hours from video progress
      const totalMinutes = playlists.reduce((total: number, playlist: Playlist) => {
        return total + playlist.videos.reduce((playlistTotal: number, video: Video) => {
          const durationInMinutes = (video.duration.hours * 60) + video.duration.minutes;
          return playlistTotal + (durationInMinutes * video.progress / 100);
        }, 0);
      }, 0);

      // Calculate completed videos (100% progress)
      const completedVideos = playlists.reduce((total: number, playlist: Playlist) => {
        return total + playlist.videos.filter((video: { progress: number }) => video.progress >= 100).length;
      }, 0);

      // Calculate total tasks (videos)
      const totalTasks = playlists.reduce((total: number, playlist: Playlist) => {
        return total + playlist.videos.length;
      }, 0);

      // Calculate days active (days since join date)
      const daysSinceJoin = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));

      // Calculate streaks from playlists
      playlists.forEach((playlist: Playlist) => {
        if (playlist.streakData) {
          currentStreak = Math.max(currentStreak, playlist.streakData.currentStreak);
          longestStreak = Math.max(longestStreak, playlist.streakData.longestStreak);
        }
      });

      // Update streaks based on today's activity
      if (isActiveToday) {
        currentStreak = Math.max(currentStreak, 1);
      } else {
        // Check if last activity was yesterday
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
        daysActive: Math.max(1, daysSinceJoin), // At least 1 day
        hoursLearning: Math.round(totalMinutes / 60 * 10) / 10, // Round to 1 decimal
        problemsSolved: completedVideos,
        tasksCompleted: completedVideos,
        joinDate,
        currentStreak,
        longestStreak,
        lastActivityDate
      });
    }
  }, []);

  const achievementLevel = userStats.hoursLearning >= 50 ? 'Expert' : 
                          userStats.hoursLearning >= 20 ? 'Advanced' : 
                          userStats.hoursLearning >= 5 ? 'Intermediate' : 'Beginner';

  const achievementColor = achievementLevel === 'Expert' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                          achievementLevel === 'Advanced' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                          achievementLevel === 'Intermediate' ? 'bg-gradient-to-r from-green-600 to-blue-600' :
                          'bg-gradient-to-r from-gray-600 to-green-600';

  // Theme-specific background classes
  const bgGradient = theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  const cardBg = theme === 'dark'
    ? 'glass-effect-dark'
    : 'glass-effect';

  const textColor = theme === 'dark' ? 'text-foreground' : 'text-foreground';
  const textMuted = theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground';

  // Add theme toggle handler
  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-end items-center mb-4">
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className={`rounded-full p-2 transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'hover:bg-primary/20 text-primary' 
                        : 'hover:bg-primary/10 text-primary'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {theme === 'dark' ? 'light' : 'dark'} theme
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <div className={`${cardBg} rounded-xl p-6 shadow-lg transition-all duration-300 card-hover`}>
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className={`text-3xl font-bold text-gradient mb-2`}>Your Profile</h1>
                <p className={`${textMuted} mb-3`}>Member since {new Date(userStats.joinDate).toLocaleDateString()}</p>
                <Badge className={`${achievementColor} text-white border-0 shadow-sm`}>
                  <Trophy className="w-3 h-3 mr-1" />
                  {achievementLevel} Learner
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streak Tracker */}
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <StreakTracker
              currentStreak={userStats.currentStreak}
              longestStreak={userStats.longestStreak}
              lastActivityDate={userStats.lastActivityDate}
            />
          </div>

          {/* Days Active */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                </div>
                Days Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-gradient mb-1`}>
                {userStats.daysActive}
              </div>
              <p className={`text-xs ${textMuted}`}>
                Consecutive learning days
              </p>
            </CardContent>
          </Card>

          {/* Hours Learning */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`} style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                </div>
                Hours Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-gradient mb-1`}>
                {userStats.hoursLearning}
              </div>
              <p className={`text-xs ${textMuted}`}>
                Total time invested
              </p>
            </CardContent>
          </Card>

          {/* Videos Completed */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`} style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Code className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                </div>
                Videos Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-gradient mb-1`}>
                {userStats.problemsSolved}
              </div>
              <p className={`text-xs ${textMuted}`}>
                Learning milestones reached
              </p>
            </CardContent>
          </Card>

          {/* Tasks Completed */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`} style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <CheckCircle className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                </div>
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-gradient mb-1`}>
                {userStats.tasksCompleted}
              </div>
              <p className={`text-xs ${textMuted}`}>
                Goals achieved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <ActivityHeatmap playlists={playlists} />
        </div>

        {/* Achievement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`} style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient">
                <Target className="w-5 h-5 text-primary" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMuted}`}>Current Level</span>
                <Badge variant="outline" className="font-semibold border-primary/20">
                  {achievementLevel}
                </Badge>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${textMuted}`}>Learning Streak</span>
                  <span className="font-semibold text-gradient">{userStats.daysActive} days</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textMuted}`}>Completion Rate</span>
                  <span className="font-semibold text-gradient">
                    {userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textMuted}`}>Avg. Daily Learning</span>
                  <span className="font-semibold text-gradient">
                    {userStats.daysActive > 0 ? `${Math.round((userStats.hoursLearning / userStats.daysActive) * 10) / 10}h` : '0h'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className={`${cardBg} border-0 shadow-lg card-hover animate-fade-in`} style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-gradient`}>
                <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.hoursLearning >= 10 && (
                  <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'} rounded-lg border border-primary/10`}>
                    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gradient">Dedicated Learner</p>
                      <p className={`text-xs ${textMuted}`}>Completed 10+ hours of learning</p>
                    </div>
                  </div>
                )}
                {userStats.problemsSolved >= 5 && (
                  <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'} rounded-lg border border-primary/10`}>
                    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gradient">Goal Crusher</p>
                      <p className={`text-xs ${textMuted}`}>Completed 5+ learning goals</p>
                    </div>
                  </div>
                )}
                {userStats.daysActive >= 7 && (
                  <div className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'} rounded-lg border border-primary/10`}>
                    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gradient">Consistency Master</p>
                      <p className={`text-xs ${textMuted}`}>7+ days of active learning</p>
                    </div>
                  </div>
                )}
                {userStats.hoursLearning < 5 && userStats.problemsSolved < 3 && userStats.daysActive < 3 && (
                  <div className="text-center py-4">
                    <p className={`${textMuted} text-sm`}>Keep learning to unlock achievements!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
