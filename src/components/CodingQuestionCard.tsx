
import { useState } from 'react';
import { CheckCircle2, Clock, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CodingQuestion } from '@/types/playlist';

interface CodingQuestionCardProps {
  question: CodingQuestion;
  onUpdate: (questionId: string, updates: Partial<CodingQuestion>) => void;
  delay?: number;
}

const CodingQuestionCard = ({ question, onUpdate, delay = 0 }: CodingQuestionCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(question.notes || '');
  const [timeSpent, setTimeSpent] = useState(question.timeSpent?.toString() || '0');

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  const handleSolveToggle = () => {
    const updates: Partial<CodingQuestion> = {
      solved: !question.solved,
      dateSolved: !question.solved ? new Date().toISOString() : undefined
    };
    onUpdate(question.id, updates);
  };

  const handleSaveNotes = () => {
    const updates: Partial<CodingQuestion> = {
      notes,
      timeSpent: parseInt(timeSpent) || 0
    };
    onUpdate(question.id, updates);
    setIsEditing(false);
  };

  return (
    <Card 
      className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              {question.title}
              {question.solved && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </CardTitle>
            <div className="flex gap-2 mb-2">
              <Badge className={difficultyColors[question.difficulty]}>
                {question.difficulty}
              </Badge>
              {question.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={question.solved ? "default" : "outline"}
              onClick={handleSolveToggle}
              className={question.solved ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-3 text-sm">{question.description}</p>
        
        {question.timeSpent && question.timeSpent > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Clock className="w-3 h-3" />
            <span>{question.timeSpent} minutes spent</span>
          </div>
        )}
        
        {isEditing && (
          <div className="space-y-3 mt-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-600">Time Spent (minutes)</label>
              <Input
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes, solution approach, etc..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNotes}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {question.notes && !isEditing && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            <span className="font-medium text-blue-800">Notes: </span>
            <span className="text-blue-700">{question.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodingQuestionCard;
