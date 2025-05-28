import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Code, CheckCircle, User, Trophy, Target, Zap, Moon, Sun, TrendingUp, TrendingDown, Star, Crown, Medal, Flame, Rocket, Brain, BookOpen, Award } from 'lucide-react';
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

interface Ranking {
  branch: number;
  section: number;
  college: number;
  global: number;
  metrics: {
    learningTime: number;
    activeDays: number;
    completionRate: number;
  };
  trends: {
    branch: number;
    section: number;
    college: number;
    global: number;
  };
  achievements: {
    isTopPerformer: boolean;
    isConsistent: boolean;
    isFastLearner: boolean;
    isStreakMaster: boolean;
    isKnowledgeSeeker: boolean;
    isRisingStar: boolean;
    isWeekendWarrior: boolean;
  };
  progress: {
    weekly: {
      learningTime: number;
      activeDays: number;
      completionRate: number;
    };
    monthly: {
      learningTime: number;
      activeDays: number;
      completionRate: number;
    };
  };
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
  const [rankings, setRankings] = useState<Ranking>({
    branch: 1,
    section: 1,
    college: 1,
    global: 1,
    metrics: {
      learningTime: 0,
      activeDays: 0,
      completionRate: 0
    },
    trends: {
      branch: 0,
      section: 0,
      college: 0,
      global: 0
    },
    achievements: {
      isTopPerformer: false,
      isConsistent: false,
      isFastLearner: false,
      isStreakMaster: false,
      isKnowledgeSeeker: false,
      isRisingStar: false,
      isWeekendWarrior: false
    },
    progress: {
      weekly: {
        learningTime: 0,
        activeDays: 0,
        completionRate: 0
      },
      monthly: {
        learningTime: 0,
        activeDays: 0,
        completionRate: 0
      }
    }
  });

  // Mock data for other users - In a real app, this would come from an API
  const mockUsers = [
    { learningTime: 120, activeDays: 45, completionRate: 85 },
    { learningTime: 95, activeDays: 38, completionRate: 78 },
    { learningTime: 150, activeDays: 50, completionRate: 92 },
    { learningTime: 80, activeDays: 30, completionRate: 75 },
    { learningTime: 200, activeDays: 60, completionRate: 95 },
  ];

  const calculateRank = (userMetrics: { learningTime: number; activeDays: number; completionRate: number }, allUsers: typeof mockUsers) => {
    // Calculate a weighted score based on learning time (50%), active days (30%), and completion rate (20%)
    const calculateScore = (metrics: typeof userMetrics) => {
      const maxLearningTime = Math.max(...allUsers.map(u => u.learningTime), userMetrics.learningTime);
      const maxActiveDays = Math.max(...allUsers.map(u => u.activeDays), userMetrics.activeDays);
      const maxCompletionRate = Math.max(...allUsers.map(u => u.completionRate), userMetrics.completionRate);

      const learningTimeScore = (metrics.learningTime / maxLearningTime) * 50;
      const activeDaysScore = (metrics.activeDays / maxActiveDays) * 30;
      const completionRateScore = (metrics.completionRate / maxCompletionRate) * 20;

      return learningTimeScore + activeDaysScore + completionRateScore;
    };

    const userScore = calculateScore(userMetrics);
    const allScores = [...allUsers.map(u => calculateScore(u)), userScore].sort((a, b) => b - a);
    return allScores.indexOf(userScore) + 1;
  };

  const calculateTrend = (currentRank: number, previousRank: number) => {
    if (previousRank === 0) return 0;
    return previousRank - currentRank; // Positive means improvement, negative means decline
  };

  const getAchievementBadges = (metrics: Ranking['metrics'], rank: number, trends: Ranking['trends']) => {
    return {
      isTopPerformer: rank <= 3,
      isConsistent: metrics.activeDays >= 30 && metrics.completionRate >= 80,
      isFastLearner: metrics.learningTime >= 100 && metrics.completionRate >= 90,
      isStreakMaster: metrics.activeDays >= 7 && metrics.completionRate >= 95,
      isKnowledgeSeeker: metrics.learningTime >= 50 && metrics.completionRate >= 85,
      isRisingStar: trends.global > 5, // Improved by more than 5 places
      isWeekendWarrior: metrics.activeDays >= 5 && metrics.completionRate >= 75
    };
  };

  const getAchievementIcon = (achievement: keyof Ranking['achievements']) => {
    switch (achievement) {
      case 'isTopPerformer':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'isConsistent':
        return <Medal className="w-4 h-4 text-blue-500" />;
      case 'isFastLearner':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'isStreakMaster':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'isKnowledgeSeeker':
        return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'isRisingStar':
        return <Rocket className="w-4 h-4 text-pink-500" />;
      case 'isWeekendWarrior':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getAchievementTitle = (achievement: keyof Ranking['achievements']) => {
    switch (achievement) {
      case 'isTopPerformer': return '🏆 Top Performer';
      case 'isConsistent': return '🎯 Consistent Learner';
      case 'isFastLearner': return '⚡ Fast Learner';
      case 'isStreakMaster': return '🔥 Streak Master';
      case 'isKnowledgeSeeker': return '🧠 Knowledge Seeker';
      case 'isRisingStar': return '🚀 Rising Star';
      case 'isWeekendWarrior': return '📚 Weekend Warrior';
      default: return '';
    }
  };

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

      const hoursLearning = Math.round(totalMinutes / 60 * 10) / 10;
      const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)));
      const completedVideos = playlists.reduce((total: number, playlist: Playlist) => {
        return total + playlist.videos.filter((video: { progress: number }) => video.progress >= 100).length;
      }, 0);
      const totalVideos = playlists.reduce((total: number, playlist: Playlist) => {
        return total + playlist.videos.length;
      }, 0);
      const completionRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

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

      // Calculate user metrics
      const userMetrics = {
        learningTime: hoursLearning,
        activeDays: daysActive,
        completionRate: completionRate
      };

      // Calculate rankings based on metrics
      const branchRank = calculateRank(userMetrics, mockUsers.slice(0, 2)); // Smaller group for branch
      const sectionRank = calculateRank(userMetrics, mockUsers.slice(0, 3)); // Medium group for section
      const collegeRank = calculateRank(userMetrics, mockUsers.slice(0, 4)); // Larger group for college
      const globalRank = calculateRank(userMetrics, mockUsers); // All users for global

      // Mock previous ranks for trend calculation
      const previousRanks = {
        branch: branchRank + Math.floor(Math.random() * 3) - 1,
        section: sectionRank + Math.floor(Math.random() * 3) - 1,
        college: collegeRank + Math.floor(Math.random() * 3) - 1,
        global: globalRank + Math.floor(Math.random() * 3) - 1
      };

      // Calculate trends
      const trends = {
        branch: calculateTrend(branchRank, previousRanks.branch),
        section: calculateTrend(sectionRank, previousRanks.section),
        college: calculateTrend(collegeRank, previousRanks.college),
        global: calculateTrend(globalRank, previousRanks.global)
      };

      // Calculate weekly and monthly progress
      const weeklyProgress = {
        learningTime: Math.round(userMetrics.learningTime * 0.3), // 30% of total time
        activeDays: Math.min(7, userMetrics.activeDays),
        completionRate: Math.min(100, userMetrics.completionRate * 1.2) // 20% boost for recent activity
      };

      const monthlyProgress = {
        learningTime: Math.round(userMetrics.learningTime * 0.7), // 70% of total time
        activeDays: Math.min(30, userMetrics.activeDays),
        completionRate: userMetrics.completionRate
      };

      // Calculate achievements with trends
      const achievements = getAchievementBadges(userMetrics, globalRank, trends);

      setRankings({
        branch: branchRank,
        section: sectionRank,
        college: collegeRank,
        global: globalRank,
        metrics: userMetrics,
        trends,
        achievements,
        progress: {
          weekly: weeklyProgress,
          monthly: monthlyProgress
        }
      });

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

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  // Add these new styles after the existing style constants
  const headerGradient = theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-indigo-950/95 backdrop-blur-sm'
    : 'bg-gradient-to-br from-white/95 via-blue-50/95 to-indigo-100/95 backdrop-blur-sm';

  const cardHoverEffect = 'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5';
  const statCardGradient = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50'
    : 'bg-gradient-to-br from-white/50 to-blue-50/50';

  // Add new animation keyframes
  const modernAnimations = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0px); }
    }
    @keyframes shine {
      0% { background-position: -100% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes border-dance {
      0% { border-color: rgba(var(--primary), 0.2); }
      50% { border-color: rgba(var(--primary), 0.6); }
      100% { border-color: rgba(var(--primary), 0.2); }
    }
  `;

  // Update the rankCardHover constant for simple z-axis lift
  const rankCardHover = `
    relative transition-all duration-300
    bg-gradient-to-br from-primary/5 to-primary/10
    border border-primary/10
    shadow-sm
    rounded-lg
    hover:translate-z-10
    hover:shadow-lg
    hover:border-primary/20
  `;

  // Update the rankCardGradient constant
  const rankCardGradient = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-white to-blue-50';

  // Update the tooltipStyles constant
  const tooltipStyles = `
    data-[state=open]:animate-in data-[state=closed]:animate-out
    data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
    data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
    data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
    data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
  `;

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300`}>
      {/* Enhanced Header Section */}
      <div className={`relative ${headerGradient} border-b border-border/50 shadow-lg`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-end items-center mb-6">
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className={`rounded-full p-2 transition-all duration-300 hover:scale-110 ${
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
          
          <div className={`${cardBg} rounded-2xl p-8 shadow-xl transition-all duration-300 ${cardHoverEffect} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-8">
                <Avatar className="w-24 h-24 ring-4 ring-primary/20 shadow-lg transition-transform duration-300 hover:scale-105">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-3">
                        Your Profile
                      </h1>
                      <p className={`${textMuted} mb-4 text-lg`}>
                        Member since {new Date(userStats.joinDate).toLocaleDateString()}
                      </p>
                      <Badge className={`${achievementColor} text-white border-0 shadow-lg px-4 py-1.5 text-sm font-medium`}>
                        <Trophy className="w-4 h-4 mr-2" />
                        {achievementLevel} Learner
                      </Badge>
                    </div>
                    
                    {/* Simple Rankings Display with Z-axis Lift */}
                    <div className="flex gap-5">
                      {(['branch', 'section', 'college', 'global'] as const).map((rankType) => (
                        <div 
                          key={rankType}
                          className={`text-center px-6 py-4 rounded-lg ${rankCardGradient} 
                            relative overflow-hidden ${rankCardHover}`}
                        >
                          {/* Subtle Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30" />

                          {/* Top Performer Badge */}
                          {rankings.achievements.isTopPerformer && rankType === 'global' && (
                            <div className="absolute -top-2 -right-2 z-20">
                              <div className="relative bg-primary/10 p-1 rounded-full">
                                {getAchievementIcon('isTopPerformer')}
                              </div>
                            </div>
                          )}

                          {/* Rank Type */}
                          <p className={`text-sm font-medium capitalize mb-2 relative z-10 ${textMuted}`}>
                            {rankType}
                          </p>

                          {/* Rank Number */}
                          <div className="flex items-center justify-center gap-2 relative z-10 mb-2">
                            <p className="text-2xl font-bold text-primary">
                              #{rankings[rankType]}
                            </p>
                            <div className="text-primary/80">
                              {getTrendIcon(rankings.trends[rankType])}
                            </div>
                          </div>

                          {/* Stats Display */}
                          <div className="relative z-10 bg-primary/5 rounded-md px-3 py-1.5 mx-auto max-w-[120px]">
                            <p className={`text-xs font-medium ${textMuted}`}>
                              {rankings.metrics.learningTime}h • {rankings.metrics.activeDays}d
                            </p>
                          </div>

                          {/* Achievement Icons */}
                          {rankType === 'global' && (
                            <div className="flex justify-center gap-2 mt-3 flex-wrap relative z-10">
                              {Object.entries(rankings.achievements)
                                .filter(([_, value]) => value)
                                .map(([key]) => (
                                  <div key={key} className="bg-primary/5 p-1.5 rounded-md">
                                    {getAchievementIcon(key as keyof Ranking['achievements'])}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streak Tracker */}
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className={`${cardBg} rounded-2xl shadow-xl transition-all duration-300 ${cardHoverEffect}`}>
              <StreakTracker
                currentStreak={userStats.currentStreak}
                longestStreak={userStats.longestStreak}
                lastActivityDate={userStats.lastActivityDate}
              />
            </div>
          </div>

          {/* Enhanced Stat Cards */}
          {[
            {
              title: 'Days Active',
              value: userStats.daysActive,
              icon: Calendar,
              description: 'Consecutive learning days',
              delay: '100ms'
            },
            {
              title: 'Hours Learning',
              value: userStats.hoursLearning,
              icon: Clock,
              description: 'Total time invested',
              delay: '200ms'
            },
            {
              title: 'Videos Completed',
              value: userStats.problemsSolved,
              icon: Code,
              description: 'Learning milestones reached',
              delay: '300ms'
            }
          ].map((stat, index) => (
            <Card 
              key={stat.title}
              className={`${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`}
              style={{ animationDelay: stat.delay }}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                  <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
                  </div>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className={`text-sm ${textMuted}`}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Progress Chart */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className={`${cardBg} rounded-2xl shadow-xl p-6 ${cardHoverEffect}`}>
            <ActivityHeatmap playlists={playlists} />
          </div>
        </div>

        {/* Enhanced Achievement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Progress Overview */}
          <Card className={`${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                <Target className="w-6 h-6 text-primary" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                <span className={`text-base ${textMuted}`}>Current Level</span>
                <Badge variant="outline" className="font-semibold border-primary/20 px-4 py-1.5 text-sm">
                  {achievementLevel}
                </Badge>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-4">
                {[
                  { label: 'Learning Streak', value: `${userStats.daysActive} days` },
                  { label: 'Completion Rate', value: `${userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0}%` },
                  { label: 'Avg. Daily Learning', value: `${userStats.daysActive > 0 ? `${Math.round((userStats.hoursLearning / userStats.daysActive) * 10) / 10}h` : '0h'}` }
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors duration-300">
                    <span className={`text-base ${textMuted}`}>{stat.label}</span>
                    <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recent Achievements */}
          <Card className={`${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                <Zap className="w-6 h-6 text-primary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    condition: userStats.hoursLearning >= 10,
                    icon: Trophy,
                    title: 'Dedicated Learner',
                    description: 'Completed 10+ hours of learning'
                  },
                  {
                    condition: userStats.problemsSolved >= 5,
                    icon: CheckCircle,
                    title: 'Goal Crusher',
                    description: 'Completed 5+ learning goals'
                  },
                  {
                    condition: userStats.daysActive >= 7,
                    icon: Calendar,
                    title: 'Consistency Master',
                    description: '7+ days of active learning'
                  }
                ].map((achievement, index) => (
                  achievement.condition && (
                    <div 
                      key={achievement.title}
                      className={`flex items-center gap-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'} border border-primary/10 transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 ${cardHoverEffect}`}
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                    >
                      <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'} transition-transform duration-300 group-hover:scale-110`}>
                        <achievement.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          {achievement.title}
                        </p>
                        <p className={`text-sm ${textMuted}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  )
                ))}
                {!userStats.hoursLearning && !userStats.problemsSolved && !userStats.daysActive && (
                  <div className="text-center py-8 rounded-xl border border-dashed border-primary/20">
                    <p className={`${textMuted} text-base`}>Keep learning to unlock achievements!</p>
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