import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, SkipForward } from 'lucide-react';

interface BreakSuggestion {
  type: 'stretch' | 'exercise' | 'meditation' | 'water' | 'eye-rest';
  title: string;
  description: string;
  duration: number;
  icon: string;
}

const BREAK_SUGGESTIONS: BreakSuggestion[] = [
  {
    type: 'stretch',
    title: 'Quick Stretch',
    description: 'Stand up and stretch your arms and legs to improve circulation',
    duration: 2,
    icon: '🧘‍♂️'
  },
  {
    type: 'exercise',
    title: 'Mini Workout',
    description: 'Do some quick exercises to boost energy and focus',
    duration: 5,
    icon: '💪'
  },
  {
    type: 'meditation',
    title: 'Quick Meditation',
    description: 'Take a moment to clear your mind and reset',
    duration: 3,
    icon: '🧘‍♀️'
  },
  {
    type: 'water',
    title: 'Hydration Break',
    description: 'Get up and drink some water to stay hydrated',
    duration: 1,
    icon: '💧'
  },
  {
    type: 'eye-rest',
    title: 'Eye Rest',
    description: 'Look away from the screen and focus on distant objects',
    duration: 2,
    icon: '👀'
  }
];

interface BreakSuggestionsProps {
  isBreak: boolean;
  onStartBreak: (duration: number) => void;
  onSkipBreak: () => void;
}

export function BreakSuggestions({ isBreak, onStartBreak, onSkipBreak }: BreakSuggestionsProps) {
  if (!isBreak) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Break Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BREAK_SUGGESTIONS.map((suggestion, index) => (
                <motion.div
                  key={suggestion.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors duration-300"
                >
                  <div className="text-3xl">{suggestion.icon}</div>
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>{suggestion.duration} minutes</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onStartBreak(suggestion.duration * 60)}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onSkipBreak}
                        className="gap-2"
                      >
                        <SkipForward className="h-4 w-4" />
                        Skip
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 