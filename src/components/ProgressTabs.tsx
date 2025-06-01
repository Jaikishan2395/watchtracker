import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { Playlist } from '@/types/playlist';
import { Clock, Code, Target, TrendingUp, Calendar, ArrowUp, ArrowDown, Activity, Play } from 'lucide-react';
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
  const [timeRange, setTimeRange] = useState('week');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  useEffect(() => {
    const generateProgressData = () => {
      if (!playlists || playlists.length === 0) {
        setProgressData([]);
        return;
      }

      const data: ProgressData[] = [];
      const now = new Date();
      let days = 7;
      let interval = 'day';

      switch (timeRange) {
        case 'week':
          days = 7;
          interval = 'day';
          break;
        case 'month':
          days = 30;
          interval = 'day';
          break;
        case 'year':
          days = 12;
          interval = 'month';
          break;
      }

      // Create date range
      const dateRange: Date[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        if (interval === 'day') {
          date.setDate(date.getDate() - i);
        } else {
          date.setMonth(date.getMonth() - i);
        }
        dateRange.push(date);
      }

      // Process data for each date
      dateRange.forEach(date => {
        const dateStr = interval === 'day' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        let videosCompleted = 0;
        let questionsSolved = 0;
        let watchTime = 0;
        let codingTime = 0;

        playlists.forEach(playlist => {
          if (Array.isArray(playlist.videos)) {
            playlist.videos.forEach(video => {
              if (video.completedAt) {
                const completedDate = new Date(video.completedAt);
                if (interval === 'day' && completedDate.toDateString() === date.toDateString()) {
                  videosCompleted++;
                  watchTime += video.watchTime || 0;
                } else if (interval === 'month' && 
                  completedDate.getMonth() === date.getMonth() && 
                  completedDate.getFullYear() === date.getFullYear()) {
                  videosCompleted++;
                  watchTime += video.watchTime || 0;
                }
              }
            });
          }

          if (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)) {
            playlist.codingQuestions.forEach(question => {
              if (question.dateSolved) {
                const solvedDate = new Date(question.dateSolved);
                if (interval === 'day' && solvedDate.toDateString() === date.toDateString()) {
                  questionsSolved++;
                  codingTime += question.timeSpent || 0;
                } else if (interval === 'month' && 
                  solvedDate.getMonth() === date.getMonth() && 
                  solvedDate.getFullYear() === date.getFullYear()) {
                  questionsSolved++;
                  codingTime += question.timeSpent || 0;
                }
              }
            });
          }
        });

        data.push({
          date: dateStr,
          videosCompleted,
          questionsSolved,
          watchTime,
          codingTime
        });
      });

      setProgressData(data);
    };

    generateProgressData();
  }, [playlists, timeRange]);

  const totalVideos = progressData.reduce((sum, day) => sum + day.videosCompleted, 0);
  const totalQuestions = progressData.reduce((sum, day) => sum + day.questionsSolved, 0);
  const totalWatchTime = progressData.reduce((sum, day) => sum + day.watchTime, 0);
  const totalCodingTime = progressData.reduce((sum, day) => sum + day.codingTime, 0);

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const videoTrend = progressData.length > 1 
    ? calculateTrend(
        progressData[progressData.length - 1].videosCompleted,
        progressData[progressData.length - 2].videosCompleted
      )
    : 0;

  const questionTrend = progressData.length > 1
    ? calculateTrend(
        progressData[progressData.length - 1].questionsSolved,
        progressData[progressData.length - 2].questionsSolved
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Progress Over Time</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalVideos}</p>
                {videoTrend !== 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    {videoTrend > 0 ? (
                      <span className="text-green-500 dark:text-green-400 flex items-center">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        {Math.abs(Math.round(videoTrend))}%
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 flex items-center">
                        <ArrowDown className="w-3 h-3 mr-1" />
                        {Math.abs(Math.round(videoTrend))}%
                      </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">vs last period</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalQuestions}</p>
                {questionTrend !== 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    {questionTrend > 0 ? (
                      <span className="text-green-500 dark:text-green-400 flex items-center">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        {Math.abs(Math.round(questionTrend))}%
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 flex items-center">
                        <ArrowDown className="w-3 h-3 mr-1" />
                        {Math.abs(Math.round(questionTrend))}%
                      </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">vs last period</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Watch Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(totalWatchTime)}m</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(totalWatchTime / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365))}m daily avg
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coding Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(totalCodingTime)}m</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(totalCodingTime / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365))}m daily avg
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Content Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="videosCompleted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVideos)" name="Videos Completed" />
                  <Area type="monotone" dataKey="questionsSolved" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorQuestions)" name="Questions Solved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="watchTime" name="Watch Time (min)" fill="#10b981" />
                  <Bar dataKey="codingTime" name="Coding Time (min)" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressTabs; 