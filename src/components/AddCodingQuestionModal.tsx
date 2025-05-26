
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CodingQuestion } from '@/types/playlist';
import { toast } from 'sonner';

interface AddCodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Omit<CodingQuestion, 'id' | 'solved' | 'dateAdded' | 'attempts'>) => void;
}

const AddCodingQuestionModal = ({ isOpen, onClose, onAdd }: AddCodingQuestionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [category, setCategory] = useState<'algorithms' | 'data-structures' | 'system-design' | 'dynamic-programming' | 'graphs' | 'arrays' | 'strings' | 'trees' | 'other'>('algorithms');
  const [tags, setTags] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const questionData = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      notes: '',
      timeSpent: 0,
      solutionUrl: solutionUrl.trim() || undefined,
      lastAttemptDate: undefined,
      difficulty_rating: undefined
    };

    onAdd(questionData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setCategory('algorithms');
    setTags('');
    setSolutionUrl('');
    
    onClose();
    toast.success('Coding question added successfully!');
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setCategory('algorithms');
    setTags('');
    setSolutionUrl('');
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
            <Label htmlFor="title">Question Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Two Sum Problem"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the coding problem in detail..."
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
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
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="data-structures">Data Structures</SelectItem>
                  <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                  <SelectItem value="graphs">Graphs</SelectItem>
                  <SelectItem value="arrays">Arrays</SelectItem>
                  <SelectItem value="strings">Strings</SelectItem>
                  <SelectItem value="trees">Trees</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., hash-map, two-pointers, binary-search"
            />
          </div>
          
          <div>
            <Label htmlFor="solutionUrl">Solution URL (optional)</Label>
            <Input
              id="solutionUrl"
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
            />
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
