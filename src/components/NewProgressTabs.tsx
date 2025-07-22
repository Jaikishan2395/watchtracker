import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Area, AreaChart, PieChart, Pie, Cell 
} from 'recharts';
import { Playlist } from '@/types/playlist';
import { 
  Clock, Code, Target, TrendingUp, Calendar, ArrowUp, ArrowDown, Activity, Play, Check, Users, Video, Brain, BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    unit?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {payload.map((pld, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
            <p className="text-slate-600 dark:text-slate-400">{`${pld.name}:`}</p>
            <p className="font-medium text-slate-700 dark:text-slate-300">{pld.value}{pld.unit || ''}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ProgressTabs = ({ playlists }: ProgressTabsProps) => {
  const [timeRange, setTimeRange] = useState('week');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  useEffect(() => {
    const generateProgressData = () => {
      const data: ProgressData[] = [];
      const now = new Date();
      let startDate: Date;

      if (timeRange === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
      } else if (timeRange === 'month') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
      } else {
        // Year view - show last 12 months
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 11);
        startDate.setDate(1); // Start from the beginning of the month
      }

      const dateMap = new Map<string, ProgressData>();

      playlists.forEach(playlist => {
        if (playlist.videos) {
          playlist.videos.forEach(video => {
            if (video.completedAt) {
              const completedDate = new Date(video.completedAt);
              if (completedDate >= startDate) {
                const key = timeRange === 'year' ? completedDate.toLocaleString('default', { month: 'short' }) : completedDate.toISOString().split('T')[0];
                if (!dateMap.has(key)) dateMap.set(key, { date: key, videosCompleted: 0, questionsSolved: 0, watchTime: 0, codingTime: 0 });
                const entry = dateMap.get(key)!;
                entry.videosCompleted += 1;
                entry.watchTime += video.watchTime || 0;
              }
            }
          });
        }
        if (playlist.codingQuestions) {
          playlist.codingQuestions.forEach(q => {
            const solvedDate = q.dateSolved ? new Date(q.dateSolved) : new Date();
            if (solvedDate >= startDate) {
              const key = timeRange === 'year' ? solvedDate.toLocaleString('default', { month: 'short' }) : solvedDate.toISOString().split('T')[0];
              if (!dateMap.has(key)) dateMap.set(key, { date: key, videosCompleted: 0, questionsSolved: 0, watchTime: 0, codingTime: 0 });
              const entry = dateMap.get(key)!;
              entry.questionsSolved += 1;
              entry.codingTime += q.timeSpent || 0;
            }
          });
        }
      });

      // Fill in missing dates
      const allDates = new Map<string, ProgressData>();
      const numDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
      for (let i = 0; i < numDays; i++) {
        const d = new Date(startDate);
        if (timeRange === 'year') {
          d.setMonth(d.getMonth() + i);
          const key = d.toLocaleString('default', { month: 'short' });
          allDates.set(key, { date: key, videosCompleted: 0, questionsSolved: 0, watchTime: 0, codingTime: 0 });
        } else {
          d.setDate(d.getDate() + i);
          const key = d.toISOString().split('T')[0];
          allDates.set(key, { date: key, videosCompleted: 0, questionsSolved: 0, watchTime: 0, codingTime: 0 });
        }
      }


      dateMap.forEach((value, key) => {
        if (allDates.has(key)) {
          allDates.set(key, { ...allDates.get(key)!, ...value, date: key });
        }
      });
      
      const sortedData = Array.from(allDates.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setProgressData(sortedData.map(d => ({...d, date: timeRange === 'year' ? d.date : new Date(d.date).toLocaleDateString('en-us', {month:'short', day:'numeric'})})));
    };
    generateProgressData();
  }, [playlists, timeRange]);

  const totalVideos = progressData.reduce((sum, day) => sum + day.videosCompleted, 0);
  const totalQuestions = progressData.reduce((sum, day) => sum + day.questionsSolved, 0);
  const totalWatchTime = progressData.reduce((sum, day) => sum + day.watchTime, 0);
  const totalCodingTime = progressData.reduce((sum, day) => sum + day.codingTime, 0);

  const categoryProgress = playlists
    .flatMap(p => p.codingQuestions || [])
    .reduce((acc, q) => {
      const category = q.category || 'Uncategorized';
      if (!acc[category]) acc[category] = { solved: 0, total: 0 };
      acc[category].total++;
      if (q.solved) acc[category].solved++;
      return acc;
    }, {} as Record<string, { solved: number; total: number }>);

  const categoryChartData = Object.entries(categoryProgress).map(([name, data]) => ({ name, ...data }));
  
  const overallProgressPieData = [
    { name: 'Videos Completed', value: totalVideos, color: '#3b82f6' },
    { name: 'Questions Solved', value: totalQuestions, color: '#8b5cf6' },
  ];

  const StatCard = ({ icon: Icon, title, value, unit, trend, color, delay = 0 }: {
    icon: React.ElementType;
    title: string;
    value: number | string;
    unit?: string;
    trend?: number;
    color: string;
    delay?: number;
  }) => (
    <Card className={`bg-gradient-to-br from-${color}-50 to-white dark:from-slate-800 dark:to-slate-900 border-${color}-200 dark:border-${color}-700/50 hover:shadow-lg transition-all duration-300 group wow fadeIn`} data-wow-delay={`${delay}ms`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm text-${color}-600 dark:text-${color}-400 font-medium`}>{title}</p>
            <p className={`text-3xl font-bold text-${color}-800 dark:text-${color}-200`}>
              {value}
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </p>
            {trend && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                {trend > 0 ? <TrendingUp className="w-3 h-3 text-green-500"/> : <ArrowDown className="w-3 h-3 text-red-500"/>}
                <span>{Math.abs(trend).toFixed(0)}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Progress Dashboard</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="week" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md">Week</TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md">Month</TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Video} title="Videos Watched" value={totalVideos} color="blue" delay={100}/>
        <StatCard icon={Brain} title="Problems Solved" value={totalQuestions} color="purple" delay={200}/>
        <StatCard icon={Clock} title="Watch Time" value={Math.round(totalWatchTime / 60)} unit="hr" color="green" delay={300}/>
        <StatCard icon={Activity} title="Coding Time" value={Math.round(totalCodingTime / 60)} unit="hr" color="orange" delay={400}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg wow fadeInUp" data-wow-delay="0.3s">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Activity Over Time</CardTitle>
            <CardDescription>Completed videos and solved problems in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle"/>
                <Area type="monotone" dataKey="videosCompleted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVideos)" name="Videos" unit=" completed" />
                <Area type="monotone" dataKey="questionsSolved" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorQuestions)" name="Problems" unit=" solved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg wow fadeInUp" data-wow-delay="0.4s">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Overall Progress</CardTitle>
            <CardDescription>Breakdown of all completed content.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallProgressPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill={overallProgressPieData[index].color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                        {`${overallProgressPieData[index].name} (${value})`}
                      </text>
                    );
                  }}
                >
                  {overallProgressPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg wow fadeInUp" data-wow-delay="0.5s">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Category Progress</CardTitle>
          <CardDescription>Performance across different problem categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle"/>
              <Bar dataKey="solved" stackId="a" fill="#10b981" name="Solved" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" stackId="a" fill="#e2e8f0" name="Total" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTabs; 