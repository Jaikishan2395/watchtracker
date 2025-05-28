import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { listAllQuestions } from '@/utils/listQuestions';

const QuestionList = () => {
  const [questionsByPlaylist, setQuestionsByPlaylist] = useState<ReturnType<typeof listAllQuestions>>([]);

  useEffect(() => {
    setQuestionsByPlaylist(listAllQuestions());
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
  };

  if (questionsByPlaylist.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No coding questions found in any playlist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questionsByPlaylist.map(({ playlist, questions }) => (
        <Card key={playlist} className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-50">
              📚 {playlist}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="mt-1">
                    {q.solved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-50 mb-2">
                      {q.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getDifficultyColor(q.difficulty)}>
                        {q.difficulty}
                      </Badge>
                      <Badge className={getCategoryColor(q.category)}>
                        {q.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionList; 