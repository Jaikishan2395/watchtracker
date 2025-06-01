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
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .glass-effect-dark {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .bg-grid-pattern {
    background-image: linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
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
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
  }

  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }

  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.7);
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

  const [showProgressCard, setShowProgressCard] = useState(false);
  const [progressCard, setProgressCard] = useState<ProgressCard>({
    platformName: "Learning Platform",
    totalProgress: {
      todos: 0,
      watchTime: 0,
      videosCompleted: 0,
      problemsSolved: 0,
      streak: 0,
      coins: 0
    },
    monthlyProgress: {
      todos: 0,
      watchTime: 0,
      videosCompleted: 0,
      problemsSolved: 0,
      streak: 0,
      coins: 0
    },
    achievements: {
      level: "Beginner",
      badges: []
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
          learningTime: hoursLearning,
          activeDays: daysActive,
          completionRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
        };

        // Calculate rankings and update state
        const branchRank = calculateRank(userMetrics, mockUsers.slice(0, 2));
        const sectionRank = calculateRank(userMetrics, mockUsers.slice(0, 3));
        const collegeRank = calculateRank(userMetrics, mockUsers.slice(0, 4));
        const globalRank = calculateRank(userMetrics, mockUsers);

        // Calculate trends
        const previousRanks = {
          branch: branchRank + Math.floor(Math.random() * 3) - 1,
          section: sectionRank + Math.floor(Math.random() * 3) - 1,
          college: collegeRank + Math.floor(Math.random() * 3) - 1,
          global: globalRank + Math.floor(Math.random() * 3) - 1
        };

        const trends = {
          branch: calculateTrend(branchRank, previousRanks.branch),
          section: calculateTrend(sectionRank, previousRanks.section),
          college: calculateTrend(collegeRank, previousRanks.college),
          global: calculateTrend(globalRank, previousRanks.global)
        };

        // Calculate achievements
        const achievements = getAchievementBadges(userMetrics, globalRank, trends);

        // Update rankings state
        setRankings({
          branch: branchRank,
          section: sectionRank,
          college: collegeRank,
          global: globalRank,
          metrics: userMetrics,
          trends,
          achievements,
          progress: {
            weekly: {
              learningTime: Math.round(userMetrics.learningTime * 0.3),
              activeDays: Math.min(7, userMetrics.activeDays),
              completionRate: Math.min(100, userMetrics.completionRate * 1.2)
            },
            monthly: {
              learningTime: Math.round(userMetrics.learningTime * 0.7),
              activeDays: Math.min(30, userMetrics.activeDays),
              completionRate: userMetrics.completionRate
            }
          }
        });

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      loadUserData();
    }
  }, [mounted, playlists]);

  const achievementLevel = userStats.hoursLearning >= 50 ? 'Expert' : 
                          userStats.hoursLearning >= 20 ? 'Advanced' : 
                          userStats.hoursLearning >= 5 ? 'Intermediate' : 'Beginner';

  const achievementColor = achievementLevel === 'Expert' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                          achievementLevel === 'Advanced' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                          achievementLevel === 'Intermediate' ? 'bg-gradient-to-r from-green-600 to-blue-600' :
                          'bg-gradient-to-r from-gray-600 to-green-600';

  // Theme-specific styles
  const bgGradient = mounted && theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  const cardBg = mounted && theme === 'dark'
    ? 'glass-effect-dark'
    : 'glass-effect';

  const textColor = mounted && theme === 'dark' ? 'text-foreground' : 'text-foreground';
  const textMuted = mounted && theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground';

  const headerGradient = mounted && theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-indigo-950/95 backdrop-blur-sm'
    : 'bg-gradient-to-br from-white/95 via-blue-50/95 to-indigo-100/95 backdrop-blur-sm';

  const cardHoverEffect = 'transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5';
  const statCardGradient = mounted && theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50'
    : 'bg-gradient-to-br from-white/50 to-blue-50/50';

  const rankCardGradient = mounted && theme === 'dark'
    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-white to-blue-50';

  const rankCardHover = `
    relative transition-all duration-300
    bg-gradient-to-br from-primary/5 to-primary/10
    border border-primary/10
    shadow-sm
    rounded-lg
    hover:translate-z-10
  `;

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
    <div className={`min-h-screen ${bgGradient} transition-colors duration-300`}>
      {/* Enhanced Header Section */}
      <div className={`relative ${headerGradient} border-b border-border/50 shadow-lg`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        <div className="container mx-auto px-4 py-0">
          <div className={`${cardBg} rounded-xl p-6 shadow-xl transition-all duration-300 ${cardHoverEffect} relative overflow-hidden`}>
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-8">
                {/* Profile Section - Moved to left */}
                <div className="relative group flex flex-col items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <Avatar className="w-32 h-32 ring-2 ring-primary/20 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/30 relative z-10 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-4xl font-bold">
                      <User className="w-14 h-14" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Name and Member Since */}
                  <div className="mt-6 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                      Your Profile
                    </h1>
                    <p className={`${textMuted} text-base flex items-center justify-center gap-2 mb-4`}>
                      <Calendar className="w-5 h-5" />
                      Member since {new Date(userStats.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Days Active Card */}
                <div className="w-[360px] ml-[270px]">
                  <Card 
                    className={`relative overflow-hidden ${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`}
                    style={{ animationDelay: '100ms' }}
                  >
                    {/* Enhanced Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-50" />
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
                    <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl" />
                    
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                          <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'} transition-transform duration-300 group-hover:scale-110`}>
                            <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                          </div>
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent font-semibold">
                            Days Active
                          </span>
                        </CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 hover:bg-blue-500/10"
                            >
                              <Calendar className="w-4 h-4 text-blue-500" />
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
                    <CardContent className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            {userStats.daysActive}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-sm ${textMuted}`}>
                              Consecutive learning days
                            </p>
                            {userStats.daysActive >= 7 && (
                              <Badge className={`${theme === 'dark' ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : 'bg-blue-100 text-blue-800 border border-blue-200'} shadow-sm`}>
                                Consistent!
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'} border ${theme === 'dark' ? 'border-blue-500/30' : 'border-blue-500/20'}`}>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                              {Math.round((userStats.daysActive / 30) * 100)}%
                            </div>
                            <div className={`text-xs ${textMuted}`}>Monthly Goal</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Daily Activity Display */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} animate-pulse`} />
                            <span className={`text-sm ${textMuted}`}>Today's Activity</span>
                          </div>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} flex items-center gap-1.5`}>
                            {userStats.lastActivityDate === new Date().toISOString().split('T')[0] ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                Not Active
                              </>
                            )}
                          </span>
                        </div>

                        {/* Enhanced Activity Timeline */}
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                          {[...Array(7)].map((_, index) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (6 - index));
                            const dateStr = date.toISOString().split('T')[0];
                            const isActive = userStats.lastActivityDate === dateStr;
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            
                            return (
                              <div 
                                key={index}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div 
                                  className={`w-full h-8 rounded-lg transition-all duration-300 ${
                                    isActive 
                                      ? theme === 'dark'
                                        ? 'bg-gradient-to-b from-blue-500/30 to-indigo-500/30 border border-blue-500/50'
                                        : 'bg-gradient-to-b from-blue-500/20 to-indigo-500/20 border border-blue-500/30'
                                      : theme === 'dark'
                                        ? 'bg-gray-700/50'
                                        : 'bg-gray-200/50'
                                  } ${isToday ? 'ring-2 ring-blue-500/30' : ''}`}
                                />
                                <span className={`text-[10px] ${textMuted} ${isToday ? 'font-medium text-blue-500' : ''}`}>
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="mt-4 p-2 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs ${textMuted}`}>Monthly Progress</span>
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                              {Math.round((userStats.daysActive / 30) * 100)}%
                            </span>
                          </div>
                          <div className={`h-2 w-full rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                            <div 
                              className={`h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500`}
                              style={{ width: `${Math.min(100, (userStats.daysActive / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Learning Streak Box */}
                        <div className="mt-4 p-2 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Flame className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                              <span className={`text-xs ${textMuted}`}>Learning Streak</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>
                                  {userStats.currentStreak} days
                                </span>
                                <span className={`text-xs ${textMuted}`}>•</span>
                                <span className={`text-xs ${textMuted}`}>Best: {userStats.longestStreak}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {[...Array(7)].map((_, index) => (
                              <div 
                                key={index}
                                className={`flex-1 h-1.5 rounded-full ${
                                  index < userStats.currentStreak
                                    ? theme === 'dark'
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                      : 'bg-gradient-to-r from-orange-500 to-orange-400'
                                    : theme === 'dark'
                                      ? 'bg-gray-700'
                                      : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          {userStats.currentStreak > 0 && (
                            <div className="mt-1.5 text-center">
                              <p className={`text-xs ${textMuted}`}>
                                {userStats.currentStreak === 1 ? 'First day of streak! 🎉' : 
                                 userStats.currentStreak === 7 ? 'Week streak achieved! 🎉' :
                                 `Keep going! ${7 - userStats.currentStreak} days until week streak`}
                              </p>
                              {userStats.currentStreak < userStats.longestStreak && (
                                <p className={`text-xs ${textMuted} mt-0.5`}>
                                  {userStats.longestStreak - userStats.currentStreak} days to beat your best streak!
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Earnings Section with Notification Button */}
                <div className="w-[360px]">
                  <div className="flex flex-col gap-4">
                    {/* Notification Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="relative gap-2 w-full">
                          <Bell className="w-4 h-4" />
                          Notifications
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
                            3
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col p-0 bg-gradient-to-br from-background to-background/95 backdrop-blur-sm border border-border/50 shadow-2xl">
                        <DialogHeader className="flex-shrink-0 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50">
                          <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center gap-2">
                              <Bell className="w-5 h-5" />
                              Notifications
                            </DialogTitle>
                            <Badge variant="secondary" className="px-3 py-1">
                              3 New
                            </Badge>
                          </div>
                        </DialogHeader>
                        <div className="overflow-y-auto pr-2 custom-scrollbar">
                          <div className="p-6 space-y-6">
                            {/* Latest Updates */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl blur-xl -z-10" />
                              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                Latest Updates
                              </h3>
                              <div className="space-y-3">
                                {[
                                  {
                                    type: 'update',
                                    title: 'New Course Available',
                                    description: 'Introduction to Machine Learning is now available',
                                    time: '2 hours ago',
                                    icon: BookOpen,
                                    color: 'blue'
                                  },
                                  {
                                    type: 'update',
                                    title: 'System Maintenance',
                                    description: 'Platform will be down for maintenance on Sunday',
                                    time: '5 hours ago',
                                    icon: Settings,
                                    color: 'purple'
                                  }
                                ].map((notification) => (
                                  <div 
                                    key={notification.title} 
                                    className="group flex gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                  >
                                    <div className={`p-2.5 rounded-lg bg-${notification.color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                                      <notification.icon className={`w-4 h-4 text-${notification.color}-500`} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm group-hover:text-primary transition-colors duration-300">{notification.title}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Friend Achievements */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-xl blur-xl -z-10" />
                              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-500" />
                                Friend Achievements
                              </h3>
                              <div className="space-y-3">
                                {[
                                  {
                                    type: 'achievement',
                                    friend: 'Sarah Johnson',
                                    achievement: 'Master Learner',
                                    description: 'Completed 50+ hours of learning',
                                    time: '1 hour ago',
                                    icon: Trophy,
                                    color: 'green'
                                  },
                                  {
                                    type: 'achievement',
                                    friend: 'Mike Chen',
                                    achievement: 'Streak Legend',
                                    description: 'Maintained a 30-day streak',
                                    time: '3 hours ago',
                                    icon: Flame,
                                    color: 'orange'
                                  }
                                ].map((notification) => (
                                  <div 
                                    key={notification.achievement} 
                                    className="group flex gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                  >
                                    <div className={`p-2.5 rounded-lg bg-${notification.color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                                      <notification.icon className={`w-4 h-4 text-${notification.color}-500`} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm group-hover:text-primary transition-colors duration-300">{notification.friend}</p>
                                      <p className="text-xs text-primary mt-0.5">{notification.achievement}</p>
                                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Class Achievements */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5 rounded-xl blur-xl -z-10" />
                              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                                <Award className="w-4 h-4 text-yellow-500" />
                                Class Achievements
                              </h3>
                              <div className="space-y-3">
                                {[
                                  {
                                    type: 'class',
                                    title: 'Class Milestone',
                                    description: 'Your class completed 1000+ learning hours',
                                    time: '6 hours ago',
                                    icon: Users,
                                    color: 'yellow'
                                  },
                                  {
                                    type: 'class',
                                    title: 'Top Performer',
                                    description: 'Your class ranked #1 in weekly performance',
                                    time: '1 day ago',
                                    icon: Award,
                                    color: 'amber'
                                  }
                                ].map((notification) => (
                                  <div 
                                    key={notification.title} 
                                    className="group flex gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                  >
                                    <div className={`p-2.5 rounded-lg bg-${notification.color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                                      <notification.icon className={`w-4 h-4 text-${notification.color}-500`} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm group-hover:text-primary transition-colors duration-300">{notification.title}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-t border-border/50">
                          <Button 
                            variant="ghost" 
                            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark all as read
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Earnings Card */}
                    <div className={`${cardBg} rounded-lg p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}>
                      {/* Decorative Background Elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 opacity-50" />
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-400/10 rounded-full blur-lg" />
                      <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-lg" />
                      
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className={`text-sm font-medium ${textMuted} mb-2 flex items-center gap-2`}>
                              <span className="p-2 rounded-lg bg-yellow-500/10">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                              Total Coins
                            </p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                              🪙 {Math.round(userStats.hoursLearning * 100)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${textMuted} mb-1`}>This Month</p>
                            <p className="text-lg font-semibold text-yellow-500">+🪙 {Math.round(userStats.hoursLearning * 20)}</p>
                          </div>
                        </div>
                        
                        {/* Earnings Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              label: 'Streak Bonus',
                              rate: '20 coins/hr',
                              amount: Math.round(userStats.hoursLearning * (userStats.currentStreak > 0 ? 20 : 0)),
                              icon: '🔥',
                              color: 'from-orange-500 to-orange-600',
                              condition: userStats.currentStreak > 0,
                              description: 'Active streak'
                            },
                            {
                              label: 'Completion',
                              rate: '30 coins/hr',
                              amount: Math.round(userStats.hoursLearning * (userStats.problemsSolved > 0 ? 30 : 0)),
                              icon: '✅',
                              color: 'from-purple-500 to-purple-600',
                              condition: userStats.problemsSolved > 0,
                              description: 'Task reward'
                            }
                          ].map((item) => (
                            <div 
                              key={item.label}
                              className={`flex flex-col p-2.5 rounded-lg transition-all duration-300 ${
                                item.condition === false ? 'opacity-50' : 'hover:bg-primary/5'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{item.icon}</span>
                                <p className={`text-sm font-medium ${textMuted}`}>{item.label}</p>
                              </div>
                              <div>
                                <p className={`text-base font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                  🪙 {item.amount}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.rate}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Next Milestone */}
                        {userStats.hoursLearning < 100 && (
                          <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-yellow-500">Next Milestone</span>
                                <Badge variant="outline" className="h-5 px-2 text-xs border-yellow-500/20">
                                  +🪙 {Math.round((100 - userStats.hoursLearning) * 100)}
                                </Badge>
                              </div>
                              <span className="text-sm font-semibold text-yellow-500">
                                {Math.round(100 - userStats.hoursLearning)}h to go
                              </span>
                            </div>
                            <div className="h-2 w-full bg-yellow-500/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (userStats.hoursLearning / 100) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                              <span className="p-1 rounded bg-yellow-500/10">
                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </span>
                              Reach 10,000 coins milestone
                            </p>
                          </div>
                        )}

                        {/* Quick Stats */}
                        <div className="mt-4">
                          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Learning Coins</p>
                            <p className="text-lg font-semibold text-yellow-500">
                              🪙 {Math.round(userStats.hoursLearning * 100)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Box */}
        <div className="container mx-auto px-4 py-6">
          <Card 
            className={`relative overflow-hidden ${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`}
            style={{ animationDelay: '80ms' }}
          >
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-400/10 opacity-50" />
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-pink-400/10 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className={`text-sm font-medium ${textMuted} flex items-center gap-2`}>
                <Crown className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  Your Rankings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Branch</span>
                  <span className="text-2xl font-bold text-yellow-500 flex items-center gap-1">
                    <Medal className="w-4 h-4" /> {rankings.branch}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Section</span>
                  <span className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {rankings.section}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">College</span>
                  <span className="text-2xl font-bold text-pink-500 flex items-center gap-1">
                    <Rocket className="w-4 h-4" /> {rankings.college}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Global</span>
                  <span className="text-2xl font-bold text-purple-500 flex items-center gap-1">
                    <Globe className="w-4 h-4" /> {rankings.global}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          </div>

          {/* Achievements Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
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

            {/* Recent Achievements */}
            <Card className={`${cardBg} border-0 shadow-xl rounded-2xl ${cardHoverEffect} animate-fade-in`} style={{ animationDelay: '450ms' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  <Zap className="w-6 h-6 text-primary" />
                  Recent Achievements
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Award className="w-4 h-4" />
                      View  Awards List
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="flex-shrink-0 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Your Awards & Rewards
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-2 custom-scrollbar">
                      <div className="p-6 space-y-6">
                        {/* Learning Milestones */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Learning Milestones
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.hoursLearning >= 10,
                                title: 'Dedicated Learner',
                                description: 'Completed 10+ hours of learning',
                                reward: '100 coins'
                              },
                              {
                                condition: userStats.hoursLearning >= 50,
                                title: 'Master Learner',
                                description: 'Completed 50+ hours of learning',
                                reward: '500 coins'
                              },
                              {
                                condition: userStats.hoursLearning >= 100,
                                title: 'Grand Master',
                                description: 'Completed 100+ hours of learning',
                                reward: '1000 coins'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-primary/20 bg-primary/5' : 'border-muted/20 bg-muted/5'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"}>
                                    {award.reward}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Goal Achievements */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Goal Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.problemsSolved >= 5,
                                title: 'Goal Crusher',
                                description: 'Completed 5+ learning goals',
                                reward: '50 coins'
                              },
                              {
                                condition: userStats.problemsSolved >= 20,
                                title: 'Goal Master',
                                description: 'Completed 20+ learning goals',
                                reward: '200 coins'
                              },
                              {
                                condition: userStats.problemsSolved >= 50,
                                title: 'Goal Legend',
                                description: 'Completed 50+ learning goals',
                                reward: '500 coins'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-primary/20 bg-primary/5' : 'border-muted/20 bg-muted/5'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"}>
                                    {award.reward}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Consistency Awards */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Consistency Awards
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.daysActive >= 7,
                                title: 'Consistency Master',
                                description: '7+ days of active learning',
                                reward: '70 coins'
                              },
                              {
                                condition: userStats.daysActive >= 30,
                                title: 'Monthly Warrior',
                                description: '30+ days of active learning',
                                reward: '300 coins'
                              },
                              {
                                condition: userStats.daysActive >= 100,
                                title: 'Century Club',
                                description: '100+ days of active learning',
                                reward: '1000 coins'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-primary/20 bg-primary/5' : 'border-muted/20 bg-muted/5'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"}>
                                    {award.reward}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Streak Achievements */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Streak Achievements
                          </h3>
                          <div className="space-y-3">
                            {[
                              {
                                condition: userStats.currentStreak >= 3,
                                title: 'Streak Starter',
                                description: 'Maintained a 3-day streak',
                                reward: '30 coins'
                              },
                              {
                                condition: userStats.currentStreak >= 7,
                                title: 'Week Warrior',
                                description: 'Maintained a 7-day streak',
                                reward: '100 coins'
                              },
                              {
                                condition: userStats.currentStreak >= 30,
                                title: 'Streak Legend',
                                description: 'Maintained a 30-day streak',
                                reward: '500 coins'
                              }
                            ].map((award) => (
                              <div 
                                key={award.title}
                                className={`p-4 rounded-lg border ${award.condition ? 'border-primary/20 bg-primary/5' : 'border-muted/20 bg-muted/5'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{award.title}</p>
                                    <p className="text-sm text-muted-foreground">{award.description}</p>
                                  </div>
                                  <Badge variant={award.condition ? "default" : "secondary"}>
                                    {award.reward}
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

      {/* Add Progress Card Button */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <Button
            onClick={generateProgressCard}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Progress
          </Button>
        </div>
      </div>

      {/* Update Progress Card Dialog */}
      <Dialog open={showProgressCard} onOpenChange={setShowProgressCard}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Share Your Progress
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            <div id="progress-card" className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl relative">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-xl" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-xl" />
              
              {/* Card Header */}
              <div className="text-center mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl -z-10" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                  {progressCard.platformName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">Learning Progress Report</p>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 text-sm font-medium shadow-lg shadow-blue-500/20">
                  {progressCard.achievements.level} Level
                </Badge>
              </div>

              {/* Total Progress Section */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10" />
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Total Progress
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Watch Time', value: `${progressCard.totalProgress.watchTime}h`, color: 'blue' },
                    { label: 'Videos Completed', value: progressCard.totalProgress.videosCompleted, color: 'green' },
                    { label: 'Problems Solved', value: progressCard.totalProgress.problemsSolved, color: 'purple' },
                    { label: 'Tasks Completed', value: progressCard.totalProgress.todos, color: 'orange' },
                    { label: 'Current Streak', value: `${progressCard.totalProgress.streak} days`, color: 'yellow' },
                    { label: 'Total Coins', value: `🪙 ${progressCard.totalProgress.coins}`, color: 'emerald' }
                  ].map((item) => (
                    <div 
                      key={item.label}
                      className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 p-3 rounded-lg border border-${item.color}-100 dark:border-${item.color}-800/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-${item.color}-500/10`}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                      <p className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Progress Section */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl blur-xl -z-10" />
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  This Month
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Watch Time', value: `${progressCard.monthlyProgress.watchTime}h`, color: 'blue' },
                    { label: 'Videos Completed', value: progressCard.monthlyProgress.videosCompleted, color: 'green' },
                    { label: 'Problems Solved', value: progressCard.monthlyProgress.problemsSolved, color: 'purple' },
                    { label: 'Tasks Completed', value: progressCard.monthlyProgress.todos, color: 'orange' },
                    { label: 'Monthly Streak', value: `${progressCard.monthlyProgress.streak} days`, color: 'yellow' },
                    { label: 'Monthly Coins', value: `🪙 ${progressCard.monthlyProgress.coins}`, color: 'emerald' }
                  ].map((item) => (
                    <div 
                      key={item.label}
                      className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 p-3 rounded-lg border border-${item.color}-100 dark:border-${item.color}-800/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-${item.color}-500/10`}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                      <p className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Section */}
              {progressCard.achievements.badges.length > 0 && (
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl blur-xl -z-10" />
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Achievements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {progressCard.achievements.badges.map((badge) => (
                      <Badge
                        key={badge}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 text-sm font-medium shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-t border-border/50">
            <div className="flex justify-center gap-4">
              <Button
                onClick={shareProgressCard}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={shareProgressCard}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-105"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;