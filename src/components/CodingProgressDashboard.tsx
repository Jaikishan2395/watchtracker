import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, TrendingUp, Calendar, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { PlaylistData } from '@/types/playlist';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from 'recharts';

interface CodingProgressDashboardProps {
  stats: PlaylistData;
}

const CodingProgressDashboard = ({ stats }: CodingProgressDashboardProps) => {
  const { 
    totalCodingQuestions: totalQuestions,
    solvedQuestions,
    averageTimePerQuestion: averageTime,
    currentStreak,
    longestStreak,
    categoryProgress: categoryStats
  } = stats;

  // Chart data
  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category.replace('-', ' '),
    solved: stats.solved,
    total: stats.total,
    percentage: Math.round((stats.solved / stats.total) * 100) || 0
  }));
  
  // Weekly progress with trend data
  const weeklyProgress = [
    { day: 'Mon', solved: 3, trend: 2 },
    { day: 'Tue', solved: 2, trend: 3 },
    { day: 'Wed', solved: 4, trend: 2 },
    { day: 'Thu', solved: 1, trend: 4 },
    { day: 'Fri', solved: 3, trend: 1 },
    { day: 'Sat', solved: 5, trend: 3 },
    { day: 'Sun', solved: 2, trend: 5 }
  ];

  // Custom colors for charts
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Problems Solved</p>
                <p className="text-2xl font-bold text-green-800">{solvedQuestions}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <span>of {totalQuestions} total</span>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    {Math.round((solvedQuestions / totalQuestions) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-blue-800">{currentStreak} days</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <span>longest: {longestStreak}</span>
                  {currentStreak > longestStreak && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      New Record!
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Time Spent</p>
                <p className="text-2xl font-bold text-purple-800">{Math.round(averageTime * solvedQuestions / 60)}h</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <span>avg: {Math.round(averageTime)}m per problem</span>
                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                    {Math.round(averageTime * solvedQuestions)}m total
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-orange-800">
                  {totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0}%
                </p>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <span>overall completion</span>
                  <Progress 
                    value={totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0} 
                    className="w-16 h-1 bg-orange-100"
                  />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart className="w-5 h-5 text-blue-600" />
              </div>
              Category Progress
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Distribution of solved problems across different categories</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="solved" 
                  fill="url(#colorSolved)" 
                  name="Solved Problems" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="url(#colorTotal)" 
                  name="Total Problems" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
              Weekly Activity
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Number of problems solved each day of the week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSolved)" 
                  name="Problems Solved"
                />
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                  name="Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodingProgressDashboard;
