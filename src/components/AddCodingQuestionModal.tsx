import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddCodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>) => void;
}

const AddCodingQuestionModal = ({ isOpen, onClose, onAdd }: AddCodingQuestionModalProps) => {
  const [questionContent, setQuestionContent] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [category, setCategory] = useState<CodingQuestion['category']>('algorithms');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedContent = questionContent.trim();
    if (!trimmedContent) {
      setError('Please paste the question content');
      return;
    }

    // Extract title from the first line of the content
    const lines = trimmedContent.split('\n');
    const title = lines[0].trim();
    const description = lines.slice(1).join('\n').trim();

    if (!title) {
      setError('Please include a title in the first line of the question');
      return;
    }
    
    const questionData = {
      title,
      description,
      difficulty,
      category,
      tags: [],
      notes: '',
      timeSpent: 0,
      lastAttemptDate: undefined,
      difficulty_rating: undefined
    };

    onAdd(questionData);
    
    // Reset form
    setQuestionContent('');
    setDifficulty('easy');
    setCategory('algorithms');
    setError(null);
    
    onClose();
    toast.success('Coding question added successfully!');
  };

  const handleClose = () => {
    setQuestionContent('');
    setDifficulty('easy');
    setCategory('algorithms');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Coding Question
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="questionContent">Question Content *</Label>
            <Textarea
              id="questionContent"
              value={questionContent}
              onChange={(e) => {
                setQuestionContent(e.target.value);
                setError(null);
              }}
              placeholder="Paste the entire question content here. First line should be the title."
              className={`min-h-[200px] ${error ? "border-red-500" : ""}`}
              required
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Paste the entire question content. The first line will be used as the title.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: CodingQuestion['category']) => setCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="data-structures">Data Structures</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                  <SelectItem value="graphs">Graphs</SelectItem>
                  <SelectItem value="arrays">Arrays</SelectItem>
                  <SelectItem value="strings">Strings</SelectItem>
                  <SelectItem value="trees">Trees</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Question
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCodingQuestionModal;
