import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';

interface AddCodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>) => void;
}

const AddCodingQuestionModal = ({ isOpen, onClose, onAdd }: AddCodingQuestionModalProps) => {
  const [questionContent, setQuestionContent] = useState('');
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
      difficulty: 'easy' as const,
      category: 'algorithms' as const,
      tags: [],
      notes: '',
      timeSpent: 0,
      lastAttemptDate: undefined,
      difficulty_rating: undefined
    };

    onAdd(questionData);
    
    // Reset form
    setQuestionContent('');
    setError(null);
    
    onClose();
    toast.success('Coding question added successfully!');
  };

  const handleClose = () => {
    setQuestionContent('');
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
          <DialogDescription>
            Add a new coding question to your playlist. Paste the question content below, with the title in the first line.
          </DialogDescription>
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
