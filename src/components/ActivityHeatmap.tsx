import React, { useEffect, useState } from 'react';
import { Playlist } from '@/types/playlist';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isBefore, 
  addMonths, 
  isSameMonth, 
  getDay, 
  subMonths, 
  startOfDay, 
  endOfDay, 
  isAfter, 
  startOfYear, 
  endOfYear, 
  addYears, 
  subYears, 
  getWeek, 
  getMonth,
  startOfMonth,
  endOfMonth 
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityHeatmapProps {
  playlists: Playlist[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ playlists }) => {
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week'>('year');

  useEffect(() => {
    const calculateDailyActivity = () => {
      const data: Record<string, number> = {};
      const yearStart = startOfYear(new Date(displayYear, 0, 1));
      const yearEnd = endOfYear(new Date(displayYear, 11, 31));

      playlists.forEach(playlist => {
        if (playlist.type === 'video') {
          playlist.videos.forEach(video => {
            if (video.progress >= 100 && video.dateCompleted) {
              const completionDate = new Date(video.dateCompleted);
              if (isAfter(completionDate, yearStart) && isBefore(completionDate, yearEnd) || isSameDay(completionDate, yearStart) || isSameDay(completionDate, yearEnd)) {
                 const date = format(completionDate, 'yyyy-MM-dd');
                 data[date] = (data[date] || 0) + (video.duration || 0);
              }
            }
          });
        } else if (playlist.type === 'coding') {
          playlist.codingQuestions?.forEach(question => {
            if (question.solved && question.dateSolved) {
              const solvedDate = new Date(question.dateSolved);
               if (isAfter(solvedDate, yearStart) && isBefore(solvedDate, yearEnd) || isSameDay(solvedDate, yearStart) || isSameDay(solvedDate, yearEnd)) {
                 const date = format(solvedDate, 'yyyy-MM-dd');
                 data[date] = (data[date] || 0) + (question.timeSpent || 0);
               }
            }
          });
        }
      });

      setActivityData(data);
    };

    calculateDailyActivity();
  }, [playlists, displayYear]);

  const getColor = (level: number): string => {
    switch (level) {
      case 0:
        return 'bg-gray-100 hover:bg-gray-200 border border-gray-200';
      case 1:
        return 'bg-green-100 hover:bg-green-200 border border-green-200';
      case 2:
        return 'bg-green-300 hover:bg-green-400 border border-green-400';
      case 3:
        return 'bg-green-500 hover:bg-green-600 border border-green-600';
      case 4:
        return 'bg-green-700 hover:bg-green-800 border border-green-800';
      default:
        return 'bg-gray-100 hover:bg-gray-200 border border-gray-200';
    }
  };

  const renderMonthLabels = () => {
    const months = [];
    let currentDate = startOfYear(new Date(displayYear, 0, 1));
    
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      
      const startWeek = getWeek(firstWeekStart, { weekStartsOn: 0 });
      const endWeek = getWeek(lastWeekEnd, { weekStartsOn: 0 });
      const weekSpan = endWeek - startWeek + 1;
      
      months.push({
        name: format(currentDate, 'MMM'),
        startWeek,
        weekSpan
      });
      
      currentDate = addMonths(currentDate, 1);
    }

    return (
      <div className="flex justify-between text-xs text-gray-600 mt-2 px-8">
        {months.map((month, index) => (
          <div 
            key={index} 
            className={`flex-1 text-center cursor-pointer hover:text-gray-900 transition-colors duration-200 
              ${selectedMonth === index && viewMode === 'month' ? 'font-bold text-green-700' : ''}
              ${viewMode === 'year' ? 'hover:bg-gray-100 rounded px-1 py-0.5' : ''}`}
            onClick={() => {
              setSelectedMonth(index);
              setViewMode('month');
            }}
          >
            {month.name}
          </div>
        ))}
      </div>
    );
  };

  const renderControls = () => {
    return (
      <div className="flex items-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <Select
          value={viewMode}
          onValueChange={(value: 'year' | 'month' | 'week') => {
            setViewMode(value);
            if (value === 'year') {
              setSelectedMonth(null);
              setSelectedWeek(null);
            }
          }}
        >
          <SelectTrigger className="w-[120px] bg-white">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">Year View</SelectItem>
            <SelectItem value="month">Month View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === 'month' && (
          <Select
            value={selectedMonth?.toString() ?? ''}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(displayYear, i, 1), 'MMMM')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {viewMode === 'week' && (
          <Select
            value={selectedWeek?.toString() ?? ''}
            onValueChange={(value) => setSelectedWeek(parseInt(value))}
          >
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(53)].map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  const getFilteredDays = () => {
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'year') {
      startDate = startOfYear(new Date(displayYear, 0, 1));
      endDate = endOfYear(new Date(displayYear, 11, 31));
    } else if (viewMode === 'month' && selectedMonth !== null) {
      startDate = startOfMonth(new Date(displayYear, selectedMonth, 1));
      endDate = endOfMonth(new Date(displayYear, selectedMonth, 1));
    } else if (viewMode === 'week' && selectedWeek !== null) {
      startDate = startOfWeek(new Date(displayYear, 0, 1 + (selectedWeek - 1) * 7), { weekStartsOn: 0 });
      endDate = endOfWeek(new Date(displayYear, 0, 1 + (selectedWeek - 1) * 7), { weekStartsOn: 0 });
    } else {
      startDate = startOfYear(new Date(displayYear, 0, 1));
      endDate = endOfYear(new Date(displayYear, 11, 31));
    }

    const days = [];
    let day = startOfWeek(startDate, { weekStartsOn: 0 });
    const endWeekDate = endOfWeek(endDate, { weekStartsOn: 0 });

    while (isBefore(day, endWeekDate) || isSameDay(day, endWeekDate)) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const renderHeatmap = () => {
    const days = getFilteredDays();
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentMonth = -1;

    days.forEach((currentDay) => {
      const dayMonth = getMonth(currentDay);
      
      // If we're starting a new month and we have weeks, add a spacer week
      if (dayMonth !== currentMonth && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
        // Add a spacer week for month separation
        weeks.push([]);
      }
      
      currentMonth = dayMonth;
      currentWeek.push(currentDay);
      
      if (getDay(currentDay) === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const activityLevel = (date: Date): number => {
      const dateString = format(date, 'yyyy-MM-dd');
      const minutes = activityData[dateString] || 0;
      if (minutes === 0) return 0;
      if (minutes < 15) return 1;
      if (minutes < 30) return 2;
      if (minutes < 60) return 3;
      return 4;
    };

    return (
      <TooltipProvider>
        <div className="space-y-4">
          {renderControls()}
          <div className="flex items-start p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {weeks.map((week, weekIndex) => (
                <div 
                  key={weekIndex} 
                  className={`flex flex-col space-y-1 ${week.length === 0 ? 'w-3' : ''}`}
                >
                  {week.map((day, dayIndex) => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    const level = activityLevel(day);
                    const minutes = activityData[dateString] || 0;
                    const isToday = isSameDay(day, new Date());
                    const isOutsideRange = viewMode === 'month' && selectedMonth !== null && !isSameMonth(day, new Date(displayYear, selectedMonth, 1)) ||
                                         viewMode === 'week' && selectedWeek !== null && getWeek(day, { weekStartsOn: 0 }) !== selectedWeek;

                    if (isOutsideRange) {
                      return <div key={dayIndex} className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-100"></div>;
                    }

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger>
                          <div
                            className={`w-3 h-3 rounded-sm transition-colors duration-200 ${getColor(level)} 
                              ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            title={`${dateString}: ${minutes} minutes`}
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="font-medium">{format(new Date(dateString), 'MMMM d, yyyy')}</p>
                          <p className="text-sm text-gray-600">{minutes} minutes of activity</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {viewMode === 'year' && renderMonthLabels()}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-200">
        <CardTitle className="text-lg font-medium">
          Activity Heatmap {viewMode === 'month' && selectedMonth !== null ? `- ${format(new Date(displayYear, selectedMonth, 1), 'MMMM yyyy')}` : 
                           viewMode === 'week' && selectedWeek !== null ? `- Week ${selectedWeek}, ${displayYear}` : 
                           `(${displayYear})`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDisplayYear(displayYear - 1)}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDisplayYear(displayYear + 1)}
            className="hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {renderHeatmap()}
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap; 