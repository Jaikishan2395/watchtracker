import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Playlist } from '@/types/playlist';
import { Clock, Code, Target } from 'lucide-react';

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
    const calculateProgress = () => {
      const now = new Date();
      const data: ProgressData[] = [];
      let daysToShow = 0;
      let dateFormat: Intl.DateTimeFormatOptions = {};

      switch (timeRange) {
        case 'daily':
          daysToShow = 7;
          dateFormat = { weekday: 'short' };
          break;
        case 'weekly':
          daysToShow = 28;
          dateFormat = { month: 'short', day: 'numeric' };
          break;
        case 'monthly':
          daysToShow = 90;
          dateFormat = { month: 'short' };
          break;
        case 'yearly':
          daysToShow = 365;
          dateFormat = { month: 'short' };
          break;
      }

      // Initialize data points
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', dateFormat),
          videosCompleted: 0,
          questionsSolved: 0,
          watchTime: 0,
          codingTime: 0
        });
      }

      // Aggregate progress data
      playlists.forEach(playlist => {
        // Process video progress
        playlist.videos.forEach(video => {
          if (video.progress >= 100) {
            const completionDate = new Date(video.dateCompleted || playlist.createdAt);
            const daysAgo = Math.floor((now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo < daysToShow) {
              const index = daysToShow - 1 - daysAgo;
              if (index >= 0 && index < data.length) {
                data[index].videosCompleted++;
                data[index].watchTime += video.duration;
              }
            }
          }
        });

        // Process coding questions
        playlist.codingQuestions?.forEach(question => {
          if (question.solved && question.dateSolved) {
            const solvedDate = new Date(question.dateSolved);
            const daysAgo = Math.floor((now.getTime() - solvedDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo < daysToShow) {
              const index = daysToShow - 1 - daysAgo;
              if (index >= 0 && index < data.length) {
                data[index].questionsSolved++;
                data[index].codingTime += question.timeSpent || 0;
              }
            }
          }
        });
      });

      // For monthly and yearly views, aggregate data by month
      if (timeRange === 'monthly' || timeRange === 'yearly') {
        const aggregatedData: { [key: string]: ProgressData } = {};
        data.forEach(item => {
          if (!aggregatedData[item.date]) {
            aggregatedData[item.date] = { ...item };
          } else {
            aggregatedData[item.date].videosCompleted += item.videosCompleted;
            aggregatedData[item.date].questionsSolved += item.questionsSolved;
            aggregatedData[item.date].watchTime += item.watchTime;
            aggregatedData[item.date].codingTime += item.codingTime;
          }
        });
        setProgressData(Object.values(aggregatedData));
      } else {
        setProgressData(data);
      }
    };

    calculateProgress();
  }, [playlists, timeRange]);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-4">
            {/* Content Progress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Content Progress
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="videosCompleted" name="Videos Completed" fill="#3b82f6" />
                    <Bar dataKey="watchTime" name="Watch Time (min)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coding Progress */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Coding Progress
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="questionsSolved" 
                      name="Questions Solved" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="codingTime" 
                      name="Coding Time (min)" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card className="bg-white/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Videos</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {progressData.reduce((sum, day) => sum + day.videosCompleted, 0)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-2xl font-bold text-green-600">
                        {progressData.reduce((sum, day) => sum + day.questionsSolved, 0)}
                      </p>
                    </div>
                    <Code className="w-8 h-8 text-green-600" />
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