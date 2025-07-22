import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Code, CheckCircle, User, Trophy, Target, Zap, Moon, Sun, TrendingUp, TrendingDown, Star, Crown, Medal, Flame, Rocket, Brain, BookOpen, Award, AlertCircle, Info, Instagram, Facebook, Twitter, MessageCircle, Share2, Globe, Download, Share, Bell, Settings, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StreakTracker from '@/components/StreakTracker';
import { Playlist, Video } from '@/types/playlist';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { usePlaylists } from '@/context/PlaylistContext';
import html2canvas from 'html2canvas';

// CSS styles
const styles = `
  .glass-effect {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid #e5e7eb;
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .blink-red {
    animation: blinkRed 1s steps(2, start) infinite;
  }
  @keyframes blinkRed {
    0%, 100% { color: #ef4444; filter: drop-shadow(0 0 6px #ef4444); }
    50% { color: #b91c1c; filter: drop-shadow(0 0 12px #b91c1c); }
  }
`;

// Types
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

// Update ProgressCard interface
interface ProgressCard {
  platformName: string;
  totalProgress: {
    todos: number;
    watchTime: number;
    videosCompleted: number;
    problemsSolved: number;
    streak: number;
    coins: number;
  };
  monthlyProgress: {
    todos: number;
    watchTime: number;
    videosCompleted: number;
    problemsSolved: number;
    streak: number;
    coins: number;
  };
  achievements: {
    level: string;
    badges: string[];
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { playlists } = usePlaylists();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityHeatmap, setShowActivityHeatmap] = useState(false);
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

  // Helper function for trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  // Add style element to inject CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle theme mounting and initialization
  useEffect(() => {
    try {
      // Set initial theme if not set
      const currentTheme = localStorage.getItem('theme') || 'light';
      if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
        setTheme(currentTheme);
      }
      setMounted(true);
    } catch (err) {
      console.error('Error initializing theme:', err);
      setError('Failed to initialize theme');
    }
  }, [setTheme]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get or initialize join date
        let joinDate = localStorage.getItem('userJoinDate');
        if (!joinDate) {
          joinDate = new Date().toISOString();
          try {
            localStorage.setItem('userJoinDate', joinDate);
          } catch (storageError) {
            console.error('Error saving join date:', storageError);
          }
        }

        // Get or initialize last activity date
        let lastActivityDate = localStorage.getItem('lastActivityDate');
        if (!lastActivityDate) {
          lastActivityDate = new Date().toISOString().split('T')[0];
          try {
            localStorage.setItem('lastActivityDate', lastActivityDate);
          } catch (storageError) {
            console.error('Error saving last activity date:', storageError);
          }
        }

        // Calculate streaks
        const today = new Date().toISOString().split('T')[0];
        const isActiveToday = lastActivityDate === today;
        let currentStreak = 0;
        let longestStreak = 0;

        // Calculate stats from playlists
        let hoursLearning = 0;
        let completedVideos = 0;
        let totalVideos = 0;

        // Ensure playlists is an array and has valid data
        if (Array.isArray(playlists) && playlists.length > 0) {
          try {
            // Calculate total hours from video progress
            const totalMinutes = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.reduce((playlistTotal: number, video: Video) => {
                if (!video.watchTime || !video.progress) return playlistTotal;
                return playlistTotal + (video.watchTime * (video.progress || 0) / 100);
              }, 0);
            }, 0);

            hoursLearning = Math.round(totalMinutes / 60 * 10) / 10;
            completedVideos = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.filter((video: Video) => video.progress >= 100).length;
            }, 0);
            totalVideos = playlists.reduce((total: number, playlist: Playlist) => {
              if (!playlist.videos) return total;
              return total + playlist.videos.length;
            }, 0);

            // Calculate streaks from playlists
            playlists.forEach((playlist: Playlist) => {
              if (playlist.streakData) {
                currentStreak = Math.max(currentStreak, playlist.streakData.currentStreak || 0);
                longestStreak = Math.max(longestStreak, playlist.streakData.longestStreak || 0);
              }
            });
          } catch (error) {
            console.error('Error processing playlist data:', error);
            // Continue with default values if there's an error processing playlists
          }
        }

        // Calculate days active
        const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)));

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

        // Update user stats
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

        // Calculate and update rankings
        const userMetrics = {
          learningTime: userStats.hoursLearning,
          activeDays: userStats.daysActive,
          completionRate: userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0
        };

        // Calculate rankings and update state
        const branchRank = calculateRank(userMetrics, mockUsers);
        const sectionRank = calculateRank(userMetrics, mockUsers);
        const collegeRank = calculateRank(userMetrics, mockUsers);
        const globalRank = calculateRank(userMetrics, mockUsers);

        const trends = {
          branch: calculateTrend(branchRank, branchRank + 1),
          section: calculateTrend(sectionRank, sectionRank + 1),
          college: calculateTrend(collegeRank, collegeRank + 1),
          global: calculateTrend(globalRank, globalRank + 1)
        };

        const achievements = getAchievementBadges(userMetrics, globalRank, trends);

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [playlists]);

  // Calculate achievement level based on user stats
  const achievementLevel = userStats.hoursLearning >= 100 ? 'Grand Master' :
                         userStats.hoursLearning >= 50 ? 'Master' :
                         userStats.hoursLearning >= 10 ? 'Advanced' :
                         userStats.hoursLearning >= 5 ? 'Intermediate' : 'Beginner';

  const achievementColor = achievementLevel === 'Expert' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                          achievementLevel === 'Advanced' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                          achievementLevel === 'Intermediate' ? 'bg-gradient-to-r from-green-600 to-blue-600' :
                          'bg-gradient-to-r from-gray-600 to-green-600';

  // Theme-specific styles
  const bgGradient = 'bg-white';
  const cardBg = 'bg-white border border-gray-200 shadow-sm';
  const textColor = 'text-black';
  const textMuted = 'text-gray-500';
  const headerGradient = 'bg-white';
  const cardHoverEffect = 'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg';
  const statCardGradient = 'bg-white';
  const rankCardGradient = 'bg-white';
  const rankCardHover = 'relative transition-all duration-300 border border-gray-200 shadow-sm rounded-lg';

  // Remove the allAwards array and keep only the basic achievements
  const basicAchievements = [
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
  ];

  // Update generateProgressCard function
  const generateProgressCard = () => {
    const cardData: ProgressCard = {
      platformName: "Learning Platform",
      totalProgress: {
        todos: userStats.tasksCompleted,
        watchTime: userStats.hoursLearning,
        videosCompleted: userStats.problemsSolved,
        problemsSolved: userStats.problemsSolved,
        streak: userStats.currentStreak,
        coins: Math.round(userStats.hoursLearning * 100)
      },
      monthlyProgress: {
        todos: Math.round(userStats.tasksCompleted * 0.3),
        watchTime: Math.round(userStats.hoursLearning * 0.3),
        videosCompleted: Math.round(userStats.problemsSolved * 0.3),
        problemsSolved: Math.round(userStats.problemsSolved * 0.3),
        streak: Math.min(userStats.currentStreak, 30),
        coins: Math.round(userStats.hoursLearning * 20)
      },
      achievements: {
        level: achievementLevel,
        badges: Object.entries(rankings.achievements)
          .filter(([_, value]) => value)
          .map(([key]) => key.replace('is', ''))
      }
    };
    setProgressCard(cardData);
    setShowProgressCard(true);
  };

  // Update shareProgressCard function
  const shareProgressCard = async () => {
    try {
      const cardElement = document.getElementById('progress-card');
      if (!cardElement) return;

      const canvas = await html2canvas(cardElement, {
        scale: 2, // Higher quality
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.download = `learning-progress-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();

      // Share on social media
      if (navigator.share) {
        await navigator.share({
          title: 'My Learning Progress',
          text: `Check out my learning progress on ${progressCard.platformName}! I'm at ${progressCard.achievements.level} level with ${progressCard.totalProgress.coins} coins!`,
          files: [new File([await (await fetch(image)).blob()], 'learning-progress.png', { type: 'image/png' })]
        });
      }
    } catch (error) {
      console.error('Error sharing progress card:', error);
    }
  };

  // Add Google Fonts link for DM Serif Display
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital,wght@0,400;1,400&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300" style={{ fontFamily: 'DM Serif Display, serif' }}>
      {/* Enhanced Header Section */}
      <div className="relative border-b border-border/50 shadow-lg mt-8 md:mt-12 bg-white transition-colors duration-500">
        <div className="container mx-auto px-4 py-0">
          <div className={`${cardBg} rounded-xl p-4 transition-all duration-300 ${cardHoverEffect} relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex items-start justify-end w-full">
                {/* Profile Section - Moved to left */}
                <div className="relative group flex flex-col items-center min-w-0 mr-auto">
                  <Avatar className="w-20 h-20 ring-2 ring-gray-200 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-gray-300 relative z-10 mb-3">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gray-100 text-black text-2xl font-bold">
                      <User className="w-8 h-8 text-black" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Name and Member Since */}
                  <div className="mt-3 text-center">
                    <h1 className="text-xl font-bold text-black mb-1">
                      Your Profile
                    </h1>
                    <p className={`${textMuted} text-sm flex items-center justify-center gap-2 mb-2`}>
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Member since {new Date(userStats.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Days Active Card */}
                <div className="w-[320px] flex-shrink-0 -mr-8">
                  <Card 
                    className={`relative overflow-hidden ${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`}
                    style={{ animationDelay: '100ms' }}
                  >
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-base md:text-lg font-bold ${textMuted} flex items-center gap-2`}>
                          <div className={`p-2.5 rounded-xl bg-gray-100 transition-transform duration-300 group-hover:scale-110`}>
                            <Calendar className={`w-6 h-6 text-gray-700`} />
                          </div>
                          
                          {userStats.currentStreak >= 3 && (
                            <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold animate-pulse">
                              <Flame className="w-4 h-4 text-gray-700" /> {userStats.currentStreak}d streak
                            </span>
                          )}
                        </CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 hover:bg-gray-100"
                            >
                              <Calendar className="w-4 h-4 text-gray-700" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[90vw]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-3xl bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                                <Calendar className="w-7 h-7" />
                                Activity Overview
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-8">
                              {Array.isArray(playlists) ? (
                                <div className="w-[1300px] mx-auto">
                                  <ActivityHeatmap playlists={playlists} />
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  No activity data available
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col items-center gap-4">
                      {/* Circular Progress for Monthly Goal */}
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
                      {/* Motivational Message */}
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
                      {/* Streak Feature - Enhanced */}
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
                      {/* Enhanced Daily Activity Timeline */}
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
                                    ? theme === 'dark'
                                      ? 'bg-gradient-to-b from-blue-500/40 to-indigo-500/40 border border-blue-500/60'
                                      : 'bg-gradient-to-b from-blue-500/30 to-indigo-500/30 border border-blue-500/40'
                                    : theme === 'dark'
                                      ? 'bg-gray-700/50'
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

                {/* Earnings Section with Notification Button */}
                <div className="w-[280px]">
                  <div className="flex flex-col gap-4">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          </div>

          {/* Achievements Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-black">
                  <Target className="w-6 h-6 text-black" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-xl bg-gray-100 border border-gray-200">
                  <span className="text-base text-gray-500">Current Level</span>
                  <Badge variant="outline" className="font-semibold border-gray-300 px-4 py-1.5 text-sm text-black">
                    {achievementLevel}
                  </Badge>
                </div>
                <Separator className="bg-gray-200" />
                <div className="space-y-4">
                  {[
                    { label: 'Learning Streak', value: `${userStats.daysActive} days` },
                    { label: 'Completion Rate', value: `${userStats.problemsSolved > 0 ? Math.round((userStats.tasksCompleted / userStats.problemsSolved) * 100) : 0}%` },
                    { label: 'Avg. Daily Learning', value: `${userStats.daysActive > 0 ? `${Math.round((userStats.hoursLearning / userStats.daysActive) * 10) / 10}h` : '0h'}` }
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                      <span className="text-base text-gray-500">{stat.label}</span>
                      <span className="font-semibold text-lg text-black">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className={`${cardBg} rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '450ms' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl text-black">
                  <Zap className="w-6 h-6 text-black" />
                  Recent Achievements
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-black border-gray-300">
                      <Award className="w-4 h-4 text-black" />
                      View  Awards List
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="flex-shrink-0 p-6 bg-gray-100 border-b border-gray-200">
                      <DialogTitle className="text-2xl font-bold text-black">
                        Your Awards & Rewards
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-2 custom-scrollbar">
                      <div className="p-6 space-y-6">
                        {/* Learning Milestones */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-black">
                            <Trophy className="w-5 h-5 text-black" />
                            Learning Milestones
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.hoursLearning >= 10,
                                title: 'Dedicated Learner',
                                description: 'Completed 10+ hours of learning'
                              },
                              {
                                condition: userStats.hoursLearning >= 50,
                                title: 'Master Learner',
                                description: 'Completed 50+ hours of learning'
                              },
                              {
                                condition: userStats.hoursLearning >= 100,
                                title: 'Grand Master',
                                description: 'Completed 100+ hours of learning'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Goal Achievements */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-black">
                            <CheckCircle className="w-5 h-5 text-black" />
                            Goal Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.problemsSolved >= 5,
                                title: 'Goal Crusher',
                                description: 'Completed 5+ learning goals'
                              },
                              {
                                condition: userStats.problemsSolved >= 20,
                                title: 'Goal Master',
                                description: 'Completed 20+ learning goals'
                              },
                              {
                                condition: userStats.problemsSolved >= 50,
                                title: 'Goal Legend',
                                description: 'Completed 50+ learning goals'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Consistency Awards */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-black">
                            <Calendar className="w-5 h-5 text-black" />
                            Consistency Awards
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.daysActive >= 7,
                                title: 'Consistency Master',
                                description: '7+ days of active learning'
                              },
                              {
                                condition: userStats.daysActive >= 30,
                                title: 'Monthly Warrior',
                                description: '30+ days of active learning'
                              },
                              {
                                condition: userStats.daysActive >= 100,
                                title: 'Century Club',
                                description: '100+ days of active learning'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Streak Achievements */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-black">
                            <Flame className="w-5 h-5 text-black" />
                            Streak Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.currentStreak >= 3,
                                title: 'Streak Starter',
                                description: 'Maintained a 3-day streak'
                              },
                              {
                                condition: userStats.currentStreak >= 7,
                                title: 'Week Warrior',
                                description: 'Maintained a 7-day streak'
                              },
                              {
                                condition: userStats.currentStreak >= 30,
                                title: 'Streak Legend',
                                description: 'Maintained a 30-day streak'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"} className={award.condition ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}>
                                    {award.condition ? 'Achieved' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;