
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Code, CheckCircle, User, Trophy, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserStats {
  daysActive: number;
  hoursLearning: number;
  problemsSolved: number;
  tasksCompleted: number;
  joinDate: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    daysActive: 0,
    hoursLearning: 0,
    problemsSolved: 0,
    tasksCompleted: 0,
    joinDate: new Date().toISOString()
  });

  useEffect(() => {
    // Calculate stats from localStorage data
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    const joinDate = localStorage.getItem('userJoinDate') || new Date().toISOString();
    
    if (!localStorage.getItem('userJoinDate')) {
      localStorage.setItem('userJoinDate', joinDate);
    }

    if (savedPlaylists) {
      const playlists = JSON.parse(savedPlaylists);
      
      // Calculate total hours from video progress
      const totalMinutes = playlists.reduce((total: number, playlist: any) => {
        return total + playlist.videos.reduce((playlistTotal: number, video: any) => {
          return playlistTotal + (video.duration * video.progress / 100);
        }, 0);
      }, 0);

      // Calculate completed videos (100% progress)
      const completedVideos = playlists.reduce((total: number, playlist: any) => {
        return total + playlist.videos.filter((video: any) => video.progress >= 100).length;
      }, 0);

      // Calculate total tasks (videos)
      const totalTasks = playlists.reduce((total: number, playlist: any) => {
        return total + playlist.videos.length;
      }, 0);

      // Calculate days active (days since join date)
      const daysSinceJoin = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));

      setUserStats({
        daysActive: Math.max(1, daysSinceJoin), // At least 1 day
        hoursLearning: Math.round(totalMinutes / 60 * 10) / 10, // Round to 1 decimal
        problemsSolved: completedVideos,
        tasksCompleted: completedVideos,
        joinDate
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
                <p className="text-gray-600 mb-3">Member since {new Date(userStats.joinDate).toLocaleDateString()}</p>
                <Badge className={`${achievementColor} text-white border-0`}>
                  <Trophy className="w-3 h-3 mr-1" />
                  {achievementLevel} Learner
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Days Active */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                Days Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {userStats.daysActive}
              </div>
              <p className="text-xs text-gray-500">
                Consecutive learning days
              </p>
            </CardContent>
          </Card>

          {/* Hours Learning */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                Hours Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {userStats.hoursLearning}
              </div>
              <p className="text-xs text-gray-500">
                Total time invested
              </p>
            </CardContent>
          </Card>

          {/* Problems Solved */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <Code className="w-4 h-4 text-purple-600" />
                </div>
                Videos Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {userStats.problemsSolved}
              </div>
              <p className="text-xs text-gray-500">
                Learning milestones reached
              </p>
            </CardContent>
          </Card>

          {/* Tasks Completed */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 rounded-full bg-orange-100">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                </div>
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {userStats.tasksCompleted}
              </div>
              <p className="text-xs text-gray-500">
                Goals achieved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Level</span>
                <Badge variant="outline" className="font-semibold">
                  {achievementLevel}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Learning Streak</span>
                  <span className="font-semibold">{userStats.daysActive} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold">
                    {userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Daily Learning</span>
                  <span className="font-semibold">
                    {userStats.daysActive > 0 ? Math.round((userStats.hoursLearning / userStats.daysActive) * 10) / 10 : 0}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in" style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.hoursLearning >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Dedicated Learner</p>
                      <p className="text-xs text-gray-600">Completed 10+ hours of learning</p>
                    </div>
                  </div>
                )}
                {userStats.problemsSolved >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Goal Crusher</p>
                      <p className="text-xs text-gray-600">Completed 5+ learning goals</p>
                    </div>
                  </div>
                )}
                {userStats.daysActive >= 7 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Consistency Master</p>
                      <p className="text-xs text-gray-600">7+ days of active learning</p>
                    </div>
                  </div>
                )}
                {userStats.hoursLearning < 5 && userStats.problemsSolved < 3 && userStats.daysActive < 3 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Keep learning to unlock achievements!</p>
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
