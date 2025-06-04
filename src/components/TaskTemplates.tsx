import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Clock, List } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  estimatedPomodoros: number;
  category: string;
  subtasks: string[];
}

const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'coding',
    name: 'Coding Session',
    description: 'Standard coding task template',
    estimatedPomodoros: 4,
    category: 'Development',
    subtasks: [
      'Set up environment',
      'Write code',
      'Test functionality',
      'Document changes'
    ]
  },
  {
    id: 'writing',
    name: 'Writing Session',
    description: 'Content writing and editing',
    estimatedPomodoros: 3,
    category: 'Content',
    subtasks: [
      'Research topic',
      'Write first draft',
      'Edit and revise',
      'Final review'
    ]
  },
  {
    id: 'study',
    name: 'Study Session',
    description: 'Learning and reviewing material',
    estimatedPomodoros: 4,
    category: 'Learning',
    subtasks: [
      'Read material',
      'Take notes',
      'Practice problems',
      'Review concepts'
    ]
  }
];

interface TaskTemplatesProps {
  onSelectTemplate: (template: TaskTemplate) => void;
}

export function TaskTemplates({ onSelectTemplate }: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(DEFAULT_TEMPLATES);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: '',
    description: '',
    estimatedPomodoros: 1,
    category: '',
    subtasks: ['']
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.category) return;

    const template: TaskTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      estimatedPomodoros: newTemplate.estimatedPomodoros || 1,
      category: newTemplate.category,
      subtasks: newTemplate.subtasks?.filter(Boolean) || []
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      description: '',
      estimatedPomodoros: 1,
      category: '',
      subtasks: ['']
    });
    setIsCreating(false);
  };

  const addSubtask = () => {
    setNewTemplate(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), '']
    }));
  };

  const updateSubtask = (index: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map((task, i) => i === index ? value : task)
    }));
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Task Templates
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Cancel' : 'New Template'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 rounded-lg bg-accent/50"
              >
                <Input
                  placeholder="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-4">
                  <Input
                    placeholder="Category"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Estimated Pomodoros"
                    value={newTemplate.estimatedPomodoros}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedPomodoros: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subtasks</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addSubtask}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subtask
                    </Button>
                  </div>
                  {newTemplate.subtasks?.map((task, index) => (
                    <Input
                      key={index}
                      placeholder={`Subtask ${index + 1}`}
                      value={task}
                      onChange={(e) => updateSubtask(index, e.target.value)}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleCreateTemplate}
                  className="w-full gap-2"
                >
                  <Check className="h-4 w-4" />
                  Create Template
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors duration-300 cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedPomodoros} pomodoros
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <div className="space-y-2">
                  {template.subtasks.map((subtask, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <span>{subtask}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 