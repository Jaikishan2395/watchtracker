
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, TrendingUp, Calendar, Flame } from 'lucide-react';
import { Playlist, CodingQuestion } from '@/types/playlist';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CodingProgressDashboardProps {
  playlists: Playlist[];
}

const CodingProgressDashboard = ({ playlists }: CodingProgressDashboardProps) => {
  const codingPlaylists = playlists.filter(p => p.type === 'coding');
  
  // Calculate overall stats
  const totalQuestions = codingPlaylists.reduce((sum, playlist) => 
    sum + (playlist.codingQuestions?.length || 0), 0);
  
  const solvedQuestions = codingPlaylists.reduce((sum, playlist) => 
    sum + (playlist.codingQuestions?.filter(q => q.solved).length || 0), 0);
  
  const totalTimeSpent = codingPlaylists.reduce((sum, playlist) => 
    sum + (playlist.codingQuestions?.reduce((qSum, q) => qSum + (q.timeSpent || 0), 0) || 0), 0);
  
  const averageTime = solvedQuestions > 0 ? Math.round(totalTimeSpent / solvedQuestions) : 0;
  
  // Calculate streaks
  const currentStreak = Math.max(...codingPlaylists.map(p => p.streakData?.currentStreak || 0));
  const longestStreak = Math.max(...codingPlaylists.map(p => p.streakData?.longestStreak || 0));
  
  // Category breakdown
  const categoryStats: { [key: string]: { solved: number; total: number } } = {};
  codingPlaylists.forEach(playlist => {
    playlist.codingQuestions?.forEach(question => {
      if (!categoryStats[question.category]) {
        categoryStats[question.category] = { solved: 0, total: 0 };
      }
      categoryStats[question.category].total++;
      if (question.solved) {
        categoryStats[question.category].solved++;
      }
    });
  });
  
  // Difficulty breakdown
  const difficultyStats = { easy: { solved: 0, total: 0 }, medium: { solved: 0, total: 0 }, hard: { solved: 0, total: 0 } };
  codingPlaylists.forEach(playlist => {
    playlist.codingQuestions?.forEach(question => {
      difficultyStats[question.difficulty].total++;
      if (question.solved) {
        difficultyStats[question.difficulty].solved++;
      }
    });
  });
  
  // Chart data
  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category.replace('-', ' '),
    solved: stats.solved,
    total: stats.total,
    percentage: Math.round((stats.solved / stats.total) * 100) || 0
  }));
  
  const difficultyChartData = [
    { name: 'Easy', solved: difficultyStats.easy.solved, total: difficultyStats.easy.total, color: '#10b981' },
    { name: 'Medium', solved: difficultyStats.medium.solved, total: difficultyStats.medium.total, color: '#f59e0b' },
    { name: 'Hard', solved: difficultyStats.hard.solved, total: difficultyStats.hard.total, color: '#ef4444' }
  ];
  
  // Weekly progress (mock data for demonstration)
  const weeklyProgress = [
    { day: 'Mon', solved: 3 },
    { day: 'Tue', solved: 2 },
    { day: 'Wed', solved: 4 },
    { day: 'Thu', solved: 1 },
    { day: 'Fri', solved: 3 },
    { day: 'Sat', solved: 5 },
    { day: 'Sun', solved: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Problems Solved</p>
                <p className="text-2xl font-bold text-green-800">{solvedQuestions}</p>
                <p className="text-xs text-green-600">of {totalQuestions} total</p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-blue-800">{currentStreak} days</p>
                <p className="text-xs text-blue-600">longest: {longestStreak}</p>
              </div>
              <Flame className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Time Spent</p>
                <p className="text-2xl font-bold text-purple-800">{Math.round(totalTimeSpent / 60)}h</p>
                <p className="text-xs text-purple-600">avg: {averageTime}m per problem</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-orange-800">
                  {totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0}%
                </p>
                <p className="text-xs text-orange-600">overall completion</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="solved" fill="#10b981" />
                <Bar dataKey="total" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={difficultyChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="solved"
                >
                  {difficultyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {difficultyChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.solved}/{item.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="solved" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{category.replace('-', ' ')}</span>
                  <Badge variant="outline">
                    {stats.solved}/{stats.total} ({Math.round((stats.solved / stats.total) * 100) || 0}%)
                  </Badge>
                </div>
                <Progress value={(stats.solved / stats.total) * 100 || 0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingProgressDashboard;
