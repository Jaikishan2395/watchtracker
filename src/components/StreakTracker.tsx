import { Calendar, Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

const StreakTracker = ({ currentStreak, longestStreak, lastActivityDate }: StreakTrackerProps) => {
  const { theme } = useTheme();
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0];
  const isDark = theme === 'dark';
  
  return (
    <Card className={`relative overflow-hidden ${isDark ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-50" />
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
      
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'} transition-transform duration-300 group-hover:scale-110`}>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`relative inline-block`}>
              <div className={`text-3xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'} mb-2`}>
                {currentStreak}
              </div>
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isActiveToday ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center justify-center gap-1.5`}>
              <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              Current Streak
            </div>
            {isActiveToday && (
              <Badge className={`mt-3 px-3 py-1 ${isDark ? 'bg-green-900/50 text-green-300 border border-green-700/50' : 'bg-green-100 text-green-800 border border-green-200'} shadow-sm`}>
                Active Today!
              </Badge>
            )}
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
              {longestStreak}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center justify-center gap-1.5`}>
              <Trophy className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
              Best Streak
            </div>
            <div className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Keep going!
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div 
              className={`h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-500`}
              style={{ width: `${(currentStreak / Math.max(longestStreak, 1)) * 100}%` }}
            />
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            {Math.round((currentStreak / Math.max(longestStreak, 1)) * 100)}% to best streak
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
