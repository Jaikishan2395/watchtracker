import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, SkipForward, RotateCcw, Check, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BreakSuggestions } from './BreakSuggestions';
import { FocusMusic } from './FocusMusic';
import { TaskTemplates } from './TaskTemplates';
import { Settings } from './Settings';
import Achievements from './Achievements';
import { History } from './History';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  estimatedPomodoros: number;
  category: string;
  subtasks: string[];
}

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  sound: boolean;
  language: string;
  country: string;
}

interface Session {
  id: string;
  date: string;
  duration: number;
  completedPomodoros: number;
  taskName: string;
  category: string;
}

export function PomodoroTimer() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TaskTemplate | null>(null);
  const [completedSubtasks, setCompletedSubtasks] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    sound: true,
    language: 'English',
    country: 'India'
  });

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pomodoroSessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        // Failed to parse sessions from localStorage
        console.error('Failed to parse pomodoroSessions from localStorage', e);
      }
    }
  }, []);
  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    setIsRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(settings.focusDuration * 60);
    setIsBreak(false);
  }, [settings.focusDuration]);

  const handleSkip = useCallback(() => {
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(settings.focusDuration * 60);
    } else {
      setIsBreak(true);
      setTimeLeft(settings.shortBreakDuration * 60);
    }
    setIsRunning(false);
  }, [isBreak, settings.focusDuration, settings.shortBreakDuration]);

  const handleTemplateSelect = (template: TaskTemplate) => {
    setCurrentTemplate(template);
    setCompletedSubtasks([]);
  };

  const toggleSubtask = (subtask: string) => {
    setCompletedSubtasks(prev =>
      prev.includes(subtask)
        ? prev.filter(s => s !== subtask)
        : [...prev, subtask]
    );
  };

  const handleSettingsSave = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    if (!isRunning) {
      setTimeLeft(newSettings.focusDuration * 60);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (!isBreak) {
              const newCompletedPomodoros = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedPomodoros);
              
              // Update streak
              const newStreak = currentStreak + 1;
              setCurrentStreak(newStreak);
              if (newStreak > bestStreak) {
                setBestStreak(newStreak);
              }

              // Add session
              if (currentTemplate) {
                const newSession: Session = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  duration: settings.focusDuration,
                  completedPomodoros: 1,
                  taskName: currentTemplate.name,
                  category: currentTemplate.category
                };
                setSessions(prev => [newSession, ...prev]);
              }

              // Check for long break
              const shouldTakeLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
              setIsBreak(true);
              setTimeLeft(shouldTakeLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);
              
              if (settings.autoStartBreaks) {
                setIsRunning(true);
              }
            } else {
              setIsBreak(false);
              setTimeLeft(settings.focusDuration * 60);
              if (settings.autoStartPomodoros) {
                setIsRunning(true);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isBreak, settings, completedPomodoros, currentStreak, bestStreak, currentTemplate]);

  const totalFocusTime = sessions.reduce((acc, session) => acc + session.duration, 0);
  const averageSessionLength = sessions.length > 0 ? totalFocusTime / sessions.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/todo')}
          className="hover:bg-accent/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
          Pomodoro Timer
        </h1>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6" />
              {isBreak ? 'Break Time' : 'Focus Time'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              key={timeLeft}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-bold"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="flex gap-4">
              <Button
                onClick={isRunning ? handlePause : handleStart}
                className="gap-2"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
                size="lg"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                className="gap-2"
                size="lg"
              >
                <SkipForward className="h-5 w-5" />
                Skip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Settings
              settings={settings}
              onSave={handleSettingsSave}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BreakSuggestions
          isBreak={isBreak}
          onStartBreak={(duration) => {
            setTimeLeft(duration);
            setIsBreak(true);
            setIsRunning(true);
          }}
          onSkipBreak={() => {
            setIsBreak(false);
            setTimeLeft(settings.focusDuration * 60);
            setIsRunning(false);
          }}
        />

        <FocusMusic
          isPlaying={isMusicPlaying}
          onPlayStateChange={setIsMusicPlaying}
        />
      </div>

      <TaskTemplates onSelectTemplate={handleTemplateSelect} />

      {currentTemplate && (
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Current Task: {currentTemplate.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {completedSubtasks.length} / {currentTemplate.subtasks.length} completed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTemplate.subtasks.map((subtask, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors duration-300 ${
                    completedSubtasks.includes(subtask)
                      ? 'bg-primary/10 hover:bg-primary/20'
                      : 'bg-accent/50 hover:bg-accent/70'
                  }`}
                  onClick={() => toggleSubtask(subtask)}
                >
                  <div className={`flex-1 ${completedSubtasks.includes(subtask) ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask}
                  </div>
                  {completedSubtasks.includes(subtask) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Achievements
        completedPomodoros={completedPomodoros}
        totalFocusTime={totalFocusTime}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
      />

      <History
        sessions={sessions}
        totalFocusTime={totalFocusTime}
        totalPomodoros={completedPomodoros}
        averageSessionLength={averageSessionLength}
      />
    </div>
  );
} 