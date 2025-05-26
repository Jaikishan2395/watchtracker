
import { Calendar, Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

const StreakTracker = ({ currentStreak, longestStreak, lastActivityDate }: StreakTrackerProps) => {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0];
  
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="w-5 h-5 text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              Current Streak
            </div>
            {isActiveToday && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Active Today!
              </Badge>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {longestStreak}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              Best Streak
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
