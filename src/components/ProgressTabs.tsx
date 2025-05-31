import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { Playlist } from '@/types/playlist';
import { Clock, Code, Target, TrendingUp, Calendar, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressData {
  date: string;
  videosCompleted: number;
  questionsSolved: number;
  watchTime: number;
  codingTime: number;
}

interface ProgressTabsProps {
  playlists: Playlist[];
}

const ProgressTabs = ({ playlists }: ProgressTabsProps) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  useEffect(() => {
    // Generate mock data based on timeRange
    const generateData = () => {
      const data: ProgressData[] = [];
      const now = new Date();
      
      let days = 7;
      if (timeRange === 'monthly') days = 30;
      else if (timeRange === 'yearly') days = 365;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            ...(timeRange === 'yearly' && { year: 'numeric' })
          }),
          videosCompleted: Math.floor(Math.random() * 5),
          questionsSolved: Math.floor(Math.random() * 8),
          watchTime: Math.floor(Math.random() * 120),
          codingTime: Math.floor(Math.random() * 180)
        });
      }
      
      return data;
    };

    setProgressData(generateData());
  }, [timeRange]);

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const totalVideos = progressData.reduce((sum, day) => sum + day.videosCompleted, 0);
  const totalQuestions = progressData.reduce((sum, day) => sum + day.questionsSolved, 0);
  const totalTime = progressData.reduce((sum, day) => sum + day.watchTime + day.codingTime, 0);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          Progress Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger 
              value="daily" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-colors duration-200"
            >
              Daily
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-colors duration-200"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-colors duration-200"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="yearly" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-colors duration-200"
            >
              Yearly
            </TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-6">
            {/* Content Progress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                Content Progress
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your video completion and watch time over the selected period</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <defs>
                      <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
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
                      dataKey="videosCompleted" 
                      name="Videos Completed" 
                      fill="url(#colorVideos)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="watchTime" 
                      name="Watch Time (min)" 
                      fill="url(#colorWatchTime)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coding Progress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Code className="w-4 h-4 text-green-600" />
                </div>
                Coding Progress
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your coding activity and time spent solving problems</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorCodingTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
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
                      dataKey="questionsSolved" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorQuestions)" 
                      name="Questions Solved"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="codingTime" 
                      stroke="#f59e0b" 
                      fillOpacity={1} 
                      fill="url(#colorCodingTime)" 
                      name="Coding Time (min)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Videos</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {totalVideos}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <span>Last 7 days</span>
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          {Math.round(totalVideos / 7)} per day
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Questions</p>
                      <p className="text-2xl font-bold text-green-800">
                        {totalQuestions}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <span>Last 7 days</span>
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          {Math.round(totalQuestions / 7)} per day
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Time</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {Math.round(totalTime / 60)}h
                      </p>
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <span>Last 7 days</span>
                        <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                          {Math.round(totalTime / 7)}m per day
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressTabs; 