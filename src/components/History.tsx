import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History as HistoryIcon, Calendar, Clock, Target } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  duration: number;
  completedPomodoros: number;
  taskName: string;
  category: string;
}

interface HistoryProps {
  sessions: Session[];
  totalFocusTime: number;
  totalPomodoros: number;
  averageSessionLength: number;
}

export function History({
  sessions,
  totalFocusTime,
  totalPomodoros,
  averageSessionLength
}: HistoryProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5" />
          History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-accent/50"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Total Focus Time
              </div>
              <div className="text-2xl font-bold">
                {formatDuration(totalFocusTime)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-accent/50"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Total Pomodoros
              </div>
              <div className="text-2xl font-bold">
                {totalPomodoros}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-accent/50"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Average Session
              </div>
              <div className="text-2xl font-bold">
                {formatDuration(averageSessionLength)}
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{session.taskName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(session.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {session.category}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(session.duration)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.completedPomodoros} pomodoros
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 