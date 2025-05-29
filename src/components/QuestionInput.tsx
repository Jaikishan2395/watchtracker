import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles } from 'lucide-react';
import { analyzeQuestion, updateQuestionWithAnalysis } from '@/services/questionAnalysis';
import { marked } from 'marked';

interface QuestionInputProps {
  questionId: string;
  initialDescription?: string;
  onDescriptionChange?: (description: string) => void;
}

const MAX_DESCRIPTION_LENGTH = 5000;

const QuestionInput: React.FC<QuestionInputProps> = ({
  questionId,
  initialDescription = '',
  onDescriptionChange
}) => {
  const [description, setDescription] = useState<string>(initialDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved description on component mount
  useEffect(() => {
    const savedDescription = localStorage.getItem(`questionDescription_${questionId}`);
    if (savedDescription && !initialDescription) {
      setDescription(savedDescription);
      onDescriptionChange?.(savedDescription);
    }
  }, [questionId, initialDescription, onDescriptionChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only save if description has changed
    const currentSaved = localStorage.getItem(`questionDescription_${questionId}`);
    if (currentSaved !== description) {
      localStorage.setItem(`questionDescription_${questionId}`, description);
      onDescriptionChange?.(description);
      toast.success('Description saved successfully!');
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Restore previous description
    const savedDescription = localStorage.getItem(`questionDescription_${questionId}`);
    if (savedDescription) {
      setDescription(savedDescription);
    } else {
      setDescription(initialDescription);
    }
    setIsEditing(false);
  };

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeQuestion(description);
      await updateQuestionWithAnalysis(questionId, analysis);
      
      // Update the local description with the analyzed one
      setDescription(analysis.description);
      onDescriptionChange?.(analysis.description);
      
      toast.success('Question analyzed and updated successfully!');
    } catch (error) {
      console.error('Error analyzing question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze question');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const characterCount = description.length;
  const isOverLimit = characterCount > MAX_DESCRIPTION_LENGTH;

  const renderMarkdown = (content: string) => {
    const html = marked(content || '*No description provided*', {
      breaks: true,
      gfm: true
    });
    return (
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800 dark:text-gray-50 flex justify-between items-center">
          <span>Question Description</span>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !description.trim()}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Description
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing ? (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter question description..."
                  className={`min-h-[200px] font-mono ${isOverLimit ? 'border-red-500' : ''}`}
                  disabled={!isEditing}
                />
                <div className="flex justify-between items-center text-sm">
                  <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
                    {characterCount} / {MAX_DESCRIPTION_LENGTH} characters
                  </span>
                  {isOverLimit && (
                    <span className="text-red-500">
                      Description is too long
                    </span>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="preview" className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                {renderMarkdown(description)}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              {renderMarkdown(description)}
            </div>
          )}
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!description.trim() || isOverLimit}
              >
                Save Description
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionInput; 