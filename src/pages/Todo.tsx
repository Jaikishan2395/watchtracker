import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Tag, 
  Bell, 
  Filter, 
  Flag, 
  Search, 
  Repeat, 
  SortAsc, 
  SortDesc, 
  BarChart2, 
  Target, 
  LineChart,
  PieChart,
  AlertCircle,
  X,
  Play,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Download,
  Upload,
  GripVertical,
  BarChart,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Minus
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, subDays, isWithinInterval, startOfDay, startOfMonth, startOfYear, subDays as subWeeks, subMonths, subYears, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart as RechartsLineChart, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Line, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  timeBlock?: {
    startTime: string;
    endTime: string;
    type: 'focus' | 'learning' | 'break';
    color: string;
    isRecurring: boolean;
    days: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: Date;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  days: number[];
  type: 'focus' | 'learning' | 'break';
  color: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface ParsedCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

interface ParsedTimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  days: number[];
  type: 'focus' | 'learning' | 'break';
  color: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add data version and validation
const DATA_VERSION = '1.0';

interface StoredData {
  version: string;
  todos: Todo[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  lastModified: string;
}

// Add data validation
const validateTodo = (todo: unknown): todo is Todo => {
  if (typeof todo !== 'object' || todo === null) return false;
  
  const t = todo as Partial<Todo>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.priority === 'string' &&
    ['low', 'medium', 'high'].includes(t.priority) &&
    t.createdAt instanceof Date &&
    t.updatedAt instanceof Date
  );
};

const validateCategory = (category: unknown): category is Category => {
  if (typeof category !== 'object' || category === null) return false;
  
  const c = category as Partial<Category>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.color === 'string' &&
    c.createdAt instanceof Date
  );
};

// Add Settings view component
const SettingsView = ({ 
  onExport, 
  onImport, 
  onClear, 
  categories 
}: { 
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  categories: Category[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Management</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              style={{ display: 'none' }}
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </span>
            </Button>
          </label>
          <Button variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Categories</h3>
        <div className="grid gap-4">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span>{category.icon}</span>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Add this after the Todo interface
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, taskTitle }: DeleteConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[400px]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Delete Task</h3>
          </div>
          <p className="text-muted-foreground">
            Are you sure you want to delete the task "{taskTitle}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Update the trend type
type Trend = 'up' | 'down' | 'stable';

// Update TimeBasedPeriod interface
interface TimeBasedPeriod {
    total: number;
    completed: number;
  completionRate: number;
  trend: Trend;
}

// Update TimeBasedData interface
interface TimeBasedData {
    total: number;
  completed: number;
    completionRate: number;
    trend: {
      direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// Update TimeBasedChartData interface
interface TimeBasedChartData {
  timeSlot: string;
    total: number;
  completed: number;
    completionRate: number;
    trend: {
      direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

interface TimeBasedStats {
  morning: TimeBasedData;
  afternoon: TimeBasedData;
  evening: TimeBasedData;
  night: TimeBasedData;
}

interface TimeBasedData {
    total: number;
  completed: number;
    completionRate: number;
    trend: {
      direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
  completed: number;
  total: number;
  completionRate: number;
    };
  }>;
  label?: string;
}

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timeBlock: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: TimeBlock;
}

type SortField = 'priority' | 'dueDate' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

// Add this after the DeleteConfirmationDialog component
interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedDate?: Date;
  categories: Category[]; // Add categories prop
}

// Define a type for the task with optional timeOfDay
type TaskWithTimeOfDay = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> & { timeOfDay?: string };

const NewTaskDialog = ({ isOpen, onClose, onSave, selectedDate, categories }: NewTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [timeBlock, setTimeBlock] = useState<{
    startTime: string;
    endTime: string;
    type: 'focus' | 'learning' | 'break';
    color: string;
    isRecurring: boolean;
    days: number[];
  } | null>(null);
  // New: time of day block
  const [timeOfDay, setTimeOfDay] = useState<string>('');

  // Time block presets
  const timeOfDayPresets = [
    { key: 'morning', label: 'Morning', start: '05:00', end: '12:00' },
    { key: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00' },
    { key: 'evening', label: 'Evening', start: '17:00', end: '21:00' },
    { key: 'night', label: 'Night', start: '21:00', end: '05:00' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDueDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('');
      setPriority('medium');
      setNotes('');
      setTimeBlock(null);
      setTimeOfDay('');
    }
  }, [isOpen, selectedDate]);

  // When timeOfDay changes, set start/end time
  useEffect(() => {
    if (timeOfDay) {
      const preset = timeOfDayPresets.find(p => p.key === timeOfDay);
      if (preset) {
        setStartTime(preset.start);
        setEndTime(preset.end);
      }
    }
  }, [timeOfDay]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }
    const baseTask: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      completed: false,
      priority,
      category: category || undefined,
      dueDate: dueDate ? new Date(`${dueDate}T${startTime}`) : undefined,
      notes: (notes.trim() || undefined),
      timeBlock: {
        startTime,
        endTime,
        type: 'focus',
        color: '#33FFC1',
        isRecurring: false,
        days: [selectedDate ? selectedDate.getDay() : new Date().getDay()]
      }
    };
    let task: TaskWithTimeOfDay = baseTask;
    if (timeOfDay) {
      task = { ...baseTask, timeOfDay };
    }
    // Get existing tasks from localStorage
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    // Add new task
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify([...existingTasks, newTask]));
    onSave(task);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-0">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a new task with optional time block for better planning
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}>
          <div className="space-y-8 py-6">
            {/* Section: When */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">When</span>
                <span className="text-xs text-gray-400">(Choose time block or set custom time)</span>
              </div>
              <div className="flex gap-2 mb-2">
                {timeOfDayPresets.map(preset => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant={timeOfDay === preset.key ? 'default' : 'outline'}
                    onClick={() => setTimeOfDay(preset.key)}
                    className={`rounded-full px-4 py-2 flex items-center gap-2 shadow-sm transition-all duration-200 border-2 ${
                      timeOfDay === preset.key ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {preset.key === 'morning' && <span>☀️</span>}
                    {preset.key === 'afternoon' && <span>🌤️</span>}
                    {preset.key === 'evening' && <span>🌆</span>}
                    {preset.key === 'night' && <span>🌙</span>}
                    <span>{preset.label}</span>
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={!timeOfDay ? 'default' : 'outline'}
                  onClick={() => setTimeOfDay('')}
                  className={`rounded-full px-4 py-2 flex items-center gap-2 shadow-sm transition-all duration-200 border-2 ${
                    !timeOfDay ? 'bg-gray-200 dark:bg-gray-700 border-gray-400 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span>⏰</span>
                  Custom
                </Button>
              </div>
              {timeOfDay && (
                <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                  {(() => {
                    const preset = timeOfDayPresets.find(p => p.key === timeOfDay);
                    if (!preset) return null;
                    return <span>Selected: <b>{preset.label}</b> ({preset.start} - {preset.end})</span>;
                  })()}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setTimeOfDay(''); }}
                    className="w-full p-3 rounded-lg border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setTimeOfDay(''); }}
                    className="w-full p-3 rounded-lg border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Task Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Section: Details */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <span>Details</span>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes"
                className="min-h-[100px] w-full p-3 rounded-lg border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700"
              />
            </div>

            {/* Section: Category & Priority */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <span>Category & Priority</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        type="button"
                        variant={category === cat.id ? 'default' : 'outline'}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 justify-start rounded-lg border-2 transition-all duration-200 ${
                          category === cat.id ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white border-green-400 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        style={{
                          borderColor: cat.color,
                          backgroundColor: category === cat.id ? `${cat.color}20` : 'transparent',
                          color: category === cat.id ? cat.color : 'inherit'
                        }}
                      >
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority Level</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={priority === 'low' ? 'default' : 'outline'}
                      onClick={() => setPriority('low')}
                      className={`flex items-center gap-2 rounded-lg border-2 transition-all duration-200 ${
                        priority === 'low' ? 'bg-green-500 text-white border-green-500 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Low
                    </Button>
                    <Button
                      type="button"
                      variant={priority === 'medium' ? 'default' : 'outline'}
                      onClick={() => setPriority('medium')}
                      className={`flex items-center gap-2 rounded-lg border-2 transition-all duration-200 ${
                        priority === 'medium' ? 'bg-yellow-500 text-white border-yellow-500 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Medium
                    </Button>
                    <Button
                      type="button"
                      variant={priority === 'high' ? 'default' : 'outline'}
                      onClick={() => setPriority('high')}
                      className={`flex items-center gap-2 rounded-lg border-2 transition-all duration-200 ${
                        priority === 'high' ? 'bg-red-500 text-white border-red-500 scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      High
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg px-6 py-2 text-lg font-semibold flex items-center gap-2"
              >
                <span>➕</span>
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PrioritySelector = ({ priority, onSelect }: { priority: 'low' | 'medium' | 'high', onSelect: (priority: 'low' | 'medium' | 'high') => void }) => (
  <div className="flex gap-2">
    <Button
      variant={priority === 'low' ? 'default' : 'outline'}
      onClick={() => onSelect('low')}
      className="flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-green-500"></span>
      Low
    </Button>
    <Button
      variant={priority === 'medium' ? 'default' : 'outline'}
      onClick={() => onSelect('medium')}
      className="flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
      Medium
    </Button>
    <Button
      variant={priority === 'high' ? 'default' : 'outline'}
      onClick={() => onSelect('high')}
      className="flex items-center gap-2"
    >
      <span className="w-2 h-2 rounded-full bg-red-500"></span>
      High
    </Button>
  </div>
);

const CategorySelector = ({ categories, selectedCategory, onSelect }: { 
  categories: Category[], 
  selectedCategory: string, 
  onSelect: (categoryId: string) => void 
}) => (
  <div className="grid grid-cols-3 gap-2">
    {categories.map((category) => (
      <Button
        key={category.id}
        variant={selectedCategory === category.id ? 'default' : 'outline'}
        onClick={() => onSelect(category.id)}
        className="flex items-center gap-2 justify-start"
        style={{
          borderColor: category.color,
          backgroundColor: selectedCategory === category.id ? category.color + '20' : 'transparent'
        }}
      >
        {category.icon && <span>{category.icon}</span>}
        <span>{category.name}</span>
      </Button>
    ))}
  </div>
);

const TaskDialog = ({ isOpen, onClose, onSave, categories }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (task: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: Category[];
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <div className="flex gap-2">
              <Button
                variant={priority === 'low' ? 'default' : 'outline'}
                onClick={() => setPriority('low')}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Low
              </Button>
              <Button
                variant={priority === 'medium' ? 'default' : 'outline'}
                onClick={() => setPriority('medium')}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Medium
              </Button>
              <Button
                variant={priority === 'high' ? 'default' : 'outline'}
                onClick={() => setPriority('high')}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                High
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? 'default' : 'outline'}
                  onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2 justify-start"
                  style={{
                    borderColor: cat.color,
                    backgroundColor: category === cat.id ? cat.color + '20' : 'transparent'
                  }}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Task of the Day</label>
            <Input
              id="date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md h-24"
              placeholder="Add any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                if (title.trim()) {
                  onSave({
                    title: title.trim(),
                    completed: false,
                    priority,
                    category: category || undefined,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    notes: notes.trim() || undefined
                  });
                  setTitle('');
                  setPriority('medium');
                  setCategory('');
                  setDueDate('');
                  setNotes('');
                  onClose();
                }
              }}
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this after the existing interfaces
interface TimeBlockSelectorProps {
  timeBlock: {
    startTime: string;
    endTime: string;
    type: 'focus' | 'learning' | 'break';
    color: string;
    isRecurring: boolean;
    days: number[];
  } | null;
  onTimeBlockChange: (timeBlock: {
    startTime: string;
    endTime: string;
    type: 'focus' | 'learning' | 'break';
    color: string;
    isRecurring: boolean;
    days: number[];
  } | null) => void;
}

const TimeBlockSelector = ({ timeBlock, onTimeBlockChange }: TimeBlockSelectorProps) => {
  const predefinedColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const days = [
    { id: 0, name: 'Sun', short: 'S' },
    { id: 1, name: 'Mon', short: 'M' },
    { id: 2, name: 'Tue', short: 'T' },
    { id: 3, name: 'Wed', short: 'W' },
    { id: 4, name: 'Thu', short: 'T' },
    { id: 5, name: 'Fri', short: 'F' },
    { id: 6, name: 'Sat', short: 'S' }
  ];

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label>Time Block</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTimeBlockChange(timeBlock ? null : {
            startTime: '09:00',
            endTime: '10:00',
            type: 'focus',
            color: '#3B82F6',
            isRecurring: false,
            days: [new Date().getDay()]
          })}
        >
          {timeBlock ? 'Remove Time Block' : 'Add Time Block'}
        </Button>
      </div>

      {timeBlock && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={timeBlock.startTime}
                onChange={(e) => onTimeBlockChange({
                  ...timeBlock,
                  startTime: e.target.value
                })}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={timeBlock.endTime}
                onChange={(e) => onTimeBlockChange({
                  ...timeBlock,
                  endTime: e.target.value
                })}
              />
            </div>
          </div>

          <div>
            <Label>Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={timeBlock.type === 'focus' ? 'default' : 'outline'}
                onClick={() => onTimeBlockChange({
                  ...timeBlock,
                  type: 'focus'
                })}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Focus
              </Button>
              <Button
                variant={timeBlock.type === 'learning' ? 'default' : 'outline'}
                onClick={() => onTimeBlockChange({
                  ...timeBlock,
                  type: 'learning'
                })}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Learning
              </Button>
              <Button
                variant={timeBlock.type === 'break' ? 'default' : 'outline'}
                onClick={() => onTimeBlockChange({
                  ...timeBlock,
                  type: 'break'
                })}
                className="flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Break
              </Button>
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-2">
              {predefinedColors.map((color) => (
                <Button
                  key={color}
                  variant={timeBlock.color === color ? 'default' : 'outline'}
                  onClick={() => onTimeBlockChange({
                    ...timeBlock,
                    color
                  })}
                  className="w-8 h-8 p-0"
                  style={{ backgroundColor: color }}
                />
              ))}
              <Input
                type="color"
                value={timeBlock.color}
                onChange={(e) => onTimeBlockChange({
                  ...timeBlock,
                  color: e.target.value
                })}
                className="w-12 h-8 p-1"
              />
            </div>
          </div>

          <div>
            <Label>Days</Label>
            <div className="flex gap-2 mt-2">
              {days.map((day) => (
                <Button
                  key={day.id}
                  variant={timeBlock.days.includes(day.id) ? 'default' : 'outline'}
                  onClick={() => onTimeBlockChange({
                    ...timeBlock,
                    days: timeBlock.days.includes(day.id)
                      ? timeBlock.days.filter(d => d !== day.id)
                      : [...timeBlock.days, day.id]
                  })}
                  className="w-10 h-10 p-0"
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="blockRecurring"
              checked={timeBlock.isRecurring}
              onCheckedChange={(checked) => onTimeBlockChange({
                ...timeBlock,
                isRecurring: checked as boolean
              })}
            />
            <Label htmlFor="blockRecurring">Recurring</Label>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Todo() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'planner' | 'analytics'>('list');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoDate, setNewTodoDate] = useState('');
  const [newTodoTime, setNewTodoTime] = useState('09:00');
  const [newTodoCategory, setNewTodoCategory] = useState('');
  const [newTodoNotes, setNewTodoNotes] = useState('');
  const [newTodoTimeBlock, setNewTodoTimeBlock] = useState<{
    startTime: string;
    endTime: string;
    type: 'focus' | 'learning' | 'break';
    color: string;
    isRecurring: boolean;
    days: number[];
  } | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editNotes, setEditNotes] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'category' | 'dueDate'>('none');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Todo | null>(null);
  const [plannerView, setPlannerView] = useState<'week' | 'month'>('week');
  const [plannerFilter, setPlannerFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [plannerSearch, setPlannerSearch] = useState('');
  const [timeBasedStats, setTimeBasedStats] = useState<TimeBasedStats>({
    morning: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
    afternoon: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
    evening: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
    night: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } }
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [showPredictions, setShowPredictions] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'previous' | 'custom'>('previous');
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);

  const timeBlockPresets = [
    {
      title: 'Deep Work',
      startTime: '09:00',
      endTime: '12:00',
      type: 'focus' as const,
      color: '#3B82F6',
      isRecurring: true,
      days: [1, 2, 3, 4, 5] // Mon-Fri
    },
    {
      title: 'Learning Session',
      startTime: '14:00',
      endTime: '16:00',
      type: 'learning' as const,
      color: '#10B981',
      isRecurring: true,
      days: [1, 3, 5] // Mon, Wed, Fri
    },
    {
      title: 'Break',
      startTime: '12:00',
      endTime: '13:00',
      type: 'break' as const,
      color: '#F59E0B',
      isRecurring: true,
      days: [1, 2, 3, 4, 5] // Mon-Fri
    }
  ];

  const checkTimeBlockConflict = (newBlock: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>, existingBlock?: TimeBlock) => {
    const blocksToCheck = existingBlock 
      ? timeBlocks.filter(block => block.id !== existingBlock.id)
      : timeBlocks;

    return blocksToCheck.some(block => {
      // Check if blocks share any days
      const hasCommonDays = block.days.some(day => newBlock.days.includes(day));
      if (!hasCommonDays) return false;

      // Check if time ranges overlap
      const newStart = new Date(`2000-01-01T${newBlock.startTime}`);
      const newEnd = new Date(`2000-01-01T${newBlock.endTime}`);
      const existingStart = new Date(`2000-01-01T${block.startTime}`);
      const existingEnd = new Date(`2000-01-01T${block.endTime}`);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const handleTimeBlockDelete = (id: string) => {
    setTimeBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  const handleTimeBlockEdit = (timeBlock: TimeBlock) => {
    setEditingTimeBlock(timeBlock);
    setShowTimeBlockModal(true);
  };

  const handleTimeBlockSave = (timeBlock: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (checkTimeBlockConflict(timeBlock, editingTimeBlock)) {
      toast.error('Time Block Conflict', {
        description: 'This time block conflicts with an existing one. Please choose a different time or day.',
      });
      return;
    }

    if (editingTimeBlock) {
      setTimeBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === editingTimeBlock.id 
            ? { ...timeBlock, id: block.id, createdAt: block.createdAt, updatedAt: new Date() }
            : block
        )
      );
    } else {
      const newTimeBlock: TimeBlock = {
        ...timeBlock,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTimeBlocks(prevBlocks => [...prevBlocks, newTimeBlock]);
    }
    handleTimeBlockModalClose();
  };

  const handleTimeBlockModalClose = () => {
    setShowTimeBlockModal(false);
    setEditingTimeBlock(null);
  };

  const TimeBlockModal = ({ isOpen, onClose, onSave, initialData }: TimeBlockModalProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
    const [endTime, setEndTime] = useState(initialData?.endTime || '10:00');
    const [type, setType] = useState<'focus' | 'learning' | 'break'>(initialData?.type || 'focus');
    const [color, setColor] = useState(initialData?.color || '#3B82F6');
    const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
    const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.days || [new Date().getDay()]);

    const days = [
      { id: 0, name: 'Sun', short: 'S' },
      { id: 1, name: 'Mon', short: 'M' },
      { id: 2, name: 'Tue', short: 'T' },
      { id: 3, name: 'Wed', short: 'W' },
      { id: 4, name: 'Thu', short: 'T' },
      { id: 5, name: 'Fri', short: 'F' },
      { id: 6, name: 'Sat', short: 'S' }
    ];

    const handleSave = () => {
      if (!title.trim()) {
        toast.error('Time block title is required');
        return;
      }

      onSave({
        title: title.trim(),
        startTime,
        endTime,
        type,
        color,
        isRecurring,
        days: selectedDays
      });
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-0">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Time Block' : 'Create Time Block'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Schedule a time block to protect your focus time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Work Session"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-2">
                  <Button
                  variant={type === 'focus' ? 'default' : 'outline'}
                  onClick={() => setType('focus')}
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Focus
                  </Button>
                <Button
                  variant={type === 'learning' ? 'default' : 'outline'}
                  onClick={() => setType('learning')}
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Learning
                </Button>
                <Button
                  variant={type === 'break' ? 'default' : 'outline'}
                  onClick={() => setType('break')}
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Break
                </Button>
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                  <Button
                    key={c}
                    variant={color === c ? 'default' : 'outline'}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 p-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 p-1"
              />
            </div>
            </div>

            <div>
              <Label>Days</Label>
              <div className="flex gap-2 mt-2">
                {days.map((day) => (
                  <Button
                    key={day.id}
                    variant={selectedDays.includes(day.id) ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDays(prev =>
                        prev.includes(day.id)
                          ? prev.filter(d => d !== day.id)
                          : [...prev, day.id]
                      );
                    }}
                    className="w-10 h-10 p-0"
                  >
                    {day.short}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring">Recurring</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {initialData ? 'Save Changes' : 'Create Time Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const priorityColors = {
    high: 'bg-red-100 border-red-500 text-red-700',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    low: 'bg-green-100 border-green-500 text-green-700'
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };

  const priorityBgColors = {
    low: 'bg-blue-50 dark:bg-blue-900/20',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20',
    high: 'bg-red-50 dark:bg-red-900/20'
  };

  const priorityFlagColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  const PriorityFlag = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => {
    const colors = {
      low: '#3B82F6',    // blue-500
      medium: '#EAB308', // yellow-500
      high: '#EF4444'    // red-500
    };

    return (
      <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5" 
        fill={colors[priority]}
      >
        <path d="M4 24V0h2v24H4zm4-24v24l12-12L8 0z" />
      </svg>
    );
  };

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks).map((task: ParsedTodo) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
      setTodos(parsedTasks);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }, [categories]);

  const handleAddTodo = (task: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Todo = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTodos(prev => [...prev, newTask]);
    
    // Update localStorage
    const updatedTasks = [...todos, newTask];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, completed: !todo.completed, updatedAt: new Date() };
          
          // Show notification for task completion status change
          toast.info(
            updatedTodo.completed ? 'Task completed!' : 'Task marked as incomplete',
            {
              description: `"${updatedTodo.title}" has been ${updatedTodo.completed ? 'completed' : 'marked as incomplete'}.`,
              duration: 3000,
              className: updatedTodo.completed ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-100 border-gray-500 text-gray-700',
              icon: updatedTodo.completed ? '✅' : '⏳',
            }
          );
          
          return updatedTodo;
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete) {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      
      // Show notification for task deletion
      toast.error('Task deleted', {
        description: `"${todoToDelete.title}" has been removed from your tasks.`,
        duration: 4000,
        className: 'bg-red-100 border-red-500 text-red-700',
        icon: '🗑️',
      });
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDate(todo.dueDate ? format(todo.dueDate, 'yyyy-MM-dd') : '');
    setEditTime(todo.dueDate ? format(todo.dueDate, 'HH:mm') : '');
    setEditCategory(todo.category || '');
    setEditPriority(todo.priority);
    setEditNotes(todo.notes || '');
    setShowEditForm(true);
  };

  const saveEdit = () => {
    if (editingTodo) {
      const dueDate = editDate && editTime 
        ? new Date(`${editDate}T${editTime}`)
        : undefined;

      const updatedTodo: Todo = {
        ...editingTodo,
        title: editTitle,
        dueDate,
        category: editCategory || undefined,
        priority: editPriority,
        notes: editNotes || undefined,
        updatedAt: new Date()
      };

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodo.id ? updatedTodo : todo
        )
      );
      
      // Show notification for task update
      toast.success('Task updated', {
        description: `"${updatedTodo.title}" has been updated successfully.`,
        duration: 3000,
        className: priorityColors[updatedTodo.priority],
        icon: priorityIcons[updatedTodo.priority],
      });
      
      setEditingTodo(null);
      setShowEditForm(false);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setShowEditForm(false);
  };

  const sortTodos = (todos: Todo[]) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...todos].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredAndSortedTodos = sortTodos(
    todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filter === 'all' || 
        (filter === 'active' && !todo.completed) || 
        (filter === 'completed' && todo.completed);
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    })
  );

  const getProductivityStats = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const stats = {
      daily: {
        completed: todos.filter(t => t.completed && t.updatedAt.toDateString() === today.toDateString()).length,
        total: todos.filter(t => t.updatedAt.toDateString() === today.toDateString()).length
      },
      weekly: {
        completed: todos.filter(t => t.completed && t.updatedAt >= weekStart && t.updatedAt <= weekEnd).length,
        total: todos.filter(t => t.updatedAt >= weekStart && t.updatedAt <= weekEnd).length
      },
      byPriority: {
        high: todos.filter(t => t.priority === 'high').length,
        medium: todos.filter(t => t.priority === 'medium').length,
        low: todos.filter(t => t.priority === 'low').length
      },
      byCategory: categories.reduce((acc, category) => ({
        ...acc,
        [category.id]: todos.filter(t => t.category === category.id).length
      }), {} as Record<string, number>),
      totalTasks: todos.length
    };

    return stats;
  };

  const getDailyTasks = (date: Date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate.toDateString() === date.toDateString();
    });
  };

  const getTimeBasedStats = (period: 'day' | 'week' | 'month' | 'year'): TimeBasedChartData[] => {
    const now = new Date();
    const startDate = (() => {
    switch (period) {
        case 'day': return startOfDay(now);
        case 'week': return startOfWeek(now);
        case 'month': return startOfMonth(now);
        case 'year': return startOfYear(now);
      }
    })();

    const timeSlots = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 22 },
      night: { start: 22, end: 6 }
    };

    const stats: Record<string, TimeBasedChartData> = {};

    // Initialize stats for each time slot
    Object.keys(timeSlots).forEach(slot => {
      stats[slot] = {
        timeSlot: slot,
        total: 0,
        completed: 0,
        completionRate: 0,
        trend: {
          direction: 'stable',
          percentage: 0
        }
      };
    });

    // Calculate current period stats
    todos.forEach(todo => {
      if (todo.dueDate && isWithinInterval(todo.dueDate, { start: startDate, end: now })) {
        const hour = todo.dueDate.getHours();
        let slot: string;

        if (hour >= timeSlots.morning.start && hour < timeSlots.morning.end) {
          slot = 'morning';
        } else if (hour >= timeSlots.afternoon.start && hour < timeSlots.afternoon.end) {
          slot = 'afternoon';
        } else if (hour >= timeSlots.evening.start && hour < timeSlots.evening.end) {
          slot = 'evening';
        } else {
          slot = 'night';
        }

        stats[slot].total++;
        if (todo.completed) {
          stats[slot].completed++;
        }
      }
    });

    // Calculate completion rates and trends
    Object.entries(stats).forEach(([slot, data]) => {
      if (data.total > 0) {
        data.completionRate = (data.completed / data.total) * 100;
      }

      // Calculate trend (comparing with previous period)
      const previousStartDate = (() => {
        switch (period) {
          case 'day': return subDays(startDate, 1);
          case 'week': return subWeeks(startDate, 1);
          case 'month': return subMonths(startDate, 1);
          case 'year': return subYears(startDate, 1);
        }
      })();

      const previousStats = {
        total: 0,
        completed: 0
      };

      todos.forEach(todo => {
        if (todo.dueDate && isWithinInterval(todo.dueDate, { start: previousStartDate, end: startDate })) {
          const hour = todo.dueDate.getHours();
          let previousSlot: string;

          if (hour >= timeSlots.morning.start && hour < timeSlots.morning.end) {
            previousSlot = 'morning';
          } else if (hour >= timeSlots.afternoon.start && hour < timeSlots.afternoon.end) {
            previousSlot = 'afternoon';
          } else if (hour >= timeSlots.evening.start && hour < timeSlots.evening.end) {
            previousSlot = 'evening';
          } else {
            previousSlot = 'night';
          }

          if (previousSlot === slot) {
            previousStats.total++;
            if (todo.completed) {
              previousStats.completed++;
            }
          }
        }
      });

      const previousRate = previousStats.total > 0 ? (previousStats.completed / previousStats.total) * 100 : 0;
      const currentRate = data.completionRate;
      const difference = currentRate - previousRate;

      data.trend = {
        direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
        percentage: Math.abs(difference)
      };
    });

    return Object.values(stats);
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current === previous) return { icon: '→', color: 'text-gray-500' };
    const percentage = previous === 0 ? 100 : ((current - previous) / previous) * 100;
    return {
      icon: current > previous ? '↑' : '↓',
      color: current > previous ? 'text-green-500' : 'text-red-500',
      percentage: Math.abs(Math.round(percentage))
    };
  };

  const getDetailedStats = (period: 'day' | 'week' | 'month' | 'year') => {
    const currentData = getTimeBasedStats(period);
    const previousData = getTimeBasedStats(period === 'day' ? 'week' : 
      period === 'week' ? 'month' : 
      period === 'month' ? 'year' : 'year');

    const currentTotal = currentData.reduce((sum, item) => sum + (item.completed || 0), 0);
    const previousTotal = previousData.reduce((sum, item) => sum + (item.completed || 0), 0);
    const currentCreated = currentData.reduce((sum, item) => sum + (item.total || 0), 0);
    const previousCreated = previousData.reduce((sum, item) => sum + (item.total || 0), 0);

    const avgCompletionRate = currentData.reduce((sum, item) => sum + (item.completionRate || 0), 0) / currentData.length;
    const prevAvgCompletionRate = previousData.reduce((sum, item) => sum + (item.completionRate || 0), 0) / previousData.length;

    return {
      completed: {
        current: currentTotal,
        previous: previousTotal,
        trend: getTrendIndicator(currentTotal, previousTotal)
      },
      created: {
        current: currentCreated,
        previous: previousCreated,
        trend: getTrendIndicator(currentCreated, previousCreated)
      },
      completionRate: {
        current: avgCompletionRate,
        previous: prevAvgCompletionRate,
        trend: getTrendIndicator(avgCompletionRate, prevAvgCompletionRate)
      }
    };
  };

  // Update the chart tooltips to fix type errors
  const renderChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{data.date}</p>
          <p className="text-blue-500">Completed: {data.completed}</p>
          <p className="text-muted-foreground">Total: {data.total}</p>
          <p className="text-green-500">Completion Rate: {data.completionRate.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCompletionRateTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{data.date}</p>
          <p className="text-green-500">Completion Rate: {data.completionRate.toFixed(1)}%</p>
          <p className="text-muted-foreground">Total Tasks: {data.total}</p>
        </div>
      );
    }
    return null;
  };

  const startPomodoro = (todo: Todo) => {
    try {
      // Store the current task in localStorage for the Pomodoro page
      const pomodoroTask = {
        id: todo.id,
        title: todo.title,
        priority: todo.priority,
        category: todo.category
      };
      localStorage.setItem('currentPomodoroTask', JSON.stringify(pomodoroTask));
      // Navigate to the Pomodoro page
      navigate('/pomodoro');
    } catch (error) {
      console.error('Error starting Pomodoro:', error);
      toast.error('Failed to start Pomodoro timer');
    }
  };

  const handleDeleteClick = (todo: Todo) => {
    setTaskToDelete(todo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTodo(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </Button>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="border rounded p-2"
        >
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showEditForm && editingTodo && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Task</h3>
              <Button variant="ghost" size="icon" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Task title..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label>Category</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      {editCategory ? (
                        <div className="flex items-center gap-2">
                          <span>{categories.find(c => c.id === editCategory)?.icon}</span>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categories.find(c => c.id === editCategory)?.color || '#ccc' }}
                          />
                          {categories.find(c => c.id === editCategory)?.name || 'Select Category'}
                        </div>
                      ) : (
                        'Select Category'
                      )}
                      <span className="ml-2">▼</span>
                    </Button>
                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        <div className="p-1 max-h-60 overflow-y-auto">
                          {categories.map(category => (
                            <div
                              key={category.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setEditCategory(category.id);
                                setShowCategoryDropdown(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-gray-500">{category.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label>Priority</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full justify-between ${priorityColors[editPriority]}`}
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{priorityIcons[editPriority]}</span>
                        {editPriority.charAt(0).toUpperCase() + editPriority.slice(1)}
                      </div>
                      <span className="ml-2">▼</span>
                    </Button>
                    {showPriorityDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        <div className="p-1">
                          {(['low', 'medium', 'high'] as const).map(priority => (
                            <div
                              key={priority}
                              className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${priorityColors[priority]}`}
                              onClick={() => {
                                setEditPriority(priority);
                                setShowPriorityDropdown(false);
                              }}
                            >
                              <span>{priorityIcons[priority]}</span>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Add notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredAndSortedTodos.map(todo => (
          <Card key={todo.id} className={cn(
            "transition-all duration-200 hover:shadow-md max-w-[600px] min-h-[120px]",
            todo.priority === 'high' && "border-l-4 border-l-red-500",
            todo.priority === 'medium' && "border-l-4 border-l-yellow-500",
            todo.priority === 'low' && "border-l-4 border-l-blue-500",
            todo.completed && "opacity-75"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2",
                        todo.completed && "bg-green-500 border-green-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-semibold text-lg mb-1",
                      todo.completed && "line-through text-muted-foreground"
                    )}>
                      {todo.title}
                    </div>
                    {todo.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {todo.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startPomodoro(todo)}
                      className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      title="Start Pomodoro"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(todo)}
                      title="Edit Task"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(todo)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-9">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {todo.category ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50">
                        <span>{categories.find(c => c.id === todo.category)?.icon}</span>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: categories.find(c => c.id === todo.category)?.color }}
                        />
                        <span className="text-sm font-medium">
                          {categories.find(c => c.id === todo.category)?.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No category</span>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full",
                      priorityBgColors[todo.priority],
                      priorityColors[todo.priority]
                    )}>
                      <PriorityFlag priority={todo.priority} />
                      <span className="text-sm font-medium">
                        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {todo.dueDate ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {format(todo.dueDate, 'MMM d, yyyy')}
                        </span>
                        {todo.timeBlock ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(`2000-01-01T${todo.timeBlock.startTime}`), 'h:mm a')} - {format(new Date(`2000-01-01T${todo.timeBlock.endTime}`), 'h:mm a')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {format(todo.dueDate, 'h:mm a')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        taskTitle={taskToDelete?.title || ''}
      />
    </div>
  );

  // Update calculateTimeBasedStats function
  const calculateTimeBasedStats = () => {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    
    const timeSlots = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 22 },
      night: { start: 22, end: 6 }
    };

    const stats: TimeBasedStats = {
      morning: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
      afternoon: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
      evening: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } },
      night: { total: 0, completed: 0, completionRate: 0, trend: { direction: 'stable', percentage: 0 } }
    };

    // Calculate current week stats
    todos.forEach(todo => {
      if (todo.dueDate && isWithinInterval(todo.dueDate, { start: lastWeek, end: now })) {
      const hour = todo.dueDate.getHours();
        let slot: keyof TimeBasedStats;

        if (hour >= timeSlots.morning.start && hour < timeSlots.morning.end) {
          slot = 'morning';
        } else if (hour >= timeSlots.afternoon.start && hour < timeSlots.afternoon.end) {
          slot = 'afternoon';
        } else if (hour >= timeSlots.evening.start && hour < timeSlots.evening.end) {
          slot = 'evening';
      } else {
          slot = 'night';
      }

        stats[slot].total++;
      if (todo.completed) {
          stats[slot].completed++;
        }
      }
    });

    // Calculate completion rates and trends
    Object.keys(stats).forEach((slot) => {
      const key = slot as keyof TimeBasedStats;
      const currentStats = stats[key];
      
      if (currentStats.total > 0) {
        currentStats.completionRate = (currentStats.completed / currentStats.total) * 100;
      }

      // Calculate trend (comparing with previous week)
      const previousWeek = subDays(lastWeek, 7);
      const previousStats = {
        total: 0,
        completed: 0
      };

      todos.forEach(todo => {
        if (todo.dueDate && isWithinInterval(todo.dueDate, { start: previousWeek, end: lastWeek })) {
        const hour = todo.dueDate.getHours();
          let previousSlot: keyof TimeBasedStats;

          if (hour >= timeSlots.morning.start && hour < timeSlots.morning.end) {
            previousSlot = 'morning';
          } else if (hour >= timeSlots.afternoon.start && hour < timeSlots.afternoon.end) {
            previousSlot = 'afternoon';
          } else if (hour >= timeSlots.evening.start && hour < timeSlots.evening.end) {
            previousSlot = 'evening';
          } else {
            previousSlot = 'night';
          }

          if (previousSlot === key) {
            previousStats.total++;
            if (todo.completed) {
              previousStats.completed++;
            }
          }
        }
      });

      const previousRate = previousStats.total > 0 ? (previousStats.completed / previousStats.total) * 100 : 0;
      const currentRate = currentStats.completionRate;
      const difference = currentRate - previousRate;

      currentStats.trend = {
        direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
        percentage: Math.abs(difference)
      };
    });

    return stats;
  };

  // Update useEffect
  useEffect(() => {
    setTimeBasedStats(calculateTimeBasedStats());
  }, [todos]);

  const calculatePrediction = (currentStats: number, previousStats: number, period: 'day' | 'week' | 'month' | 'year'): {
    nextPeriod: number;
    confidence: number;
    factors: string[];
  } => {
    const trend = currentStats - previousStats;
    const growthRate = previousStats === 0 ? 1 : trend / previousStats;
    const factors: string[] = [];

    // Calculate prediction based on trend
    let nextPeriod = currentStats * (1 + growthRate);
    let confidence = 0.7; // Base confidence

    // Adjust confidence based on data consistency
    if (Math.abs(growthRate) > 0.5) {
      confidence -= 0.2;
      factors.push('High volatility in trends');
    }
    if (currentStats < 5) {
      confidence -= 0.1;
      factors.push('Limited data points');
    }

    // Adjust prediction based on period
    switch (period) {
      case 'day':
        nextPeriod *= 0.9; // Slight decrease for daily predictions
        break;
      case 'week':
        nextPeriod *= 1.1; // Slight increase for weekly predictions
        break;
      case 'month':
        nextPeriod *= 1.05; // Moderate increase for monthly predictions
        break;
      case 'year':
        nextPeriod *= 1.15; // Higher increase for yearly predictions
        break;
    }

    return {
      nextPeriod: Math.round(nextPeriod),
      confidence: Math.min(Math.max(confidence, 0.3), 0.9),
      factors
    };
  };

  const exportAnalyticsData = () => {
    const data = {
      period: selectedPeriod,
      dateRange: {
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd')
      },
      timeBasedStats,
      detailedStats: getDetailedStats(selectedPeriod),
      predictions: showPredictions ? timeBasedStats : undefined
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  const renderAnalyticsView = () => {
    const timeBasedStats = getTimeBasedStats('week');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeBasedStats.map((stat) => {
            const trendColor = stat.trend.direction === 'up' ? 'text-green-500' : 
                             stat.trend.direction === 'down' ? 'text-red-500' : 
                             'text-gray-500';

                          return (
              <Card key={stat.timeSlot} className="p-4">
                <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{stat.timeSlot}</span>
                      </div>
                  <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                    {stat.trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                    {stat.trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                    {stat.trend.direction === 'stable' && <Minus className="h-4 w-4" />}
                    <span>{stat.trend.percentage.toFixed(1)}%</span>
                        </div>
                        </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{stat.completionRate.toFixed(1)}%</span>
                      </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${stat.completionRate}%` }}
                      />
                    </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tasks</span>
                    <span className="font-medium">{stat.completed}/{stat.total}</span>
                    </div>
                  </div>
          </Card>
            );
          })}
            </div>
      </div>
    );
  };

  const getTasksForDate = (date: Date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate.toDateString() === date.toDateString();
    });
  };

  const getTasksByTime = (tasks: Todo[]) => {
    const morning = tasks.filter(task => {
      if (!task.dueDate) return false;
      const hour = task.dueDate.getHours();
      return hour >= 5 && hour < 12;
    });

    const afternoon = tasks.filter(task => {
      if (!task.dueDate) return false;
      const hour = task.dueDate.getHours();
      return hour >= 12 && hour < 17;
    });

    const evening = tasks.filter(task => {
      if (!task.dueDate) return false;
      const hour = task.dueDate.getHours();
      return hour >= 17 || hour < 5;
    });

    return { morning, afternoon, evening };
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const taskId = result.draggableId;
    const task = todos.find(t => t.id === taskId);
    
    if (!task) return;

    // Parse the source and destination time slots
    const [sourceDate, sourceTime] = source.droppableId.split('-');
    const [destDate, destTime] = destination.droppableId.split('-');

    // Create new due date
    const newDate = new Date(destDate);
    const [hours, minutes] = destTime.split(':').map(Number);
    newDate.setHours(hours, minutes);

    // Update the task
    const updatedTask = {
      ...task,
      dueDate: newDate,
      updatedAt: new Date()
    };

    setTodos(prevTodos =>
      prevTodos.map(t => t.id === taskId ? updatedTask : t)
    );

    toast.success('Task rescheduled', {
      description: `"${task.title}" has been moved to ${format(newDate, 'MMM d, h:mm a')}`,
      duration: 3000,
    });
  };

  const getTaskStats = (date: Date) => {
    const tasks = getTasksForDate(date);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      highPriority,
      completionRate
    };
  };

  const getTimeBlocksForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return timeBlocks.filter(block => block.days.includes(dayOfWeek));
  };

  const isTimeInBlock = (date: Date, time: string): boolean => {
    const dayOfWeek = date.getDay();
    return todos.some(todo => {
      if (!todo.timeBlock) return false;
      return todo.timeBlock.days.includes(dayOfWeek) &&
             todo.timeBlock.startTime <= time &&
             todo.timeBlock.endTime >= time;
    });
  };

  const renderPlannerView = () => {
    const timeBlocks = getTimeBlocksForDate(selectedDate);
    const tasks = getTasksForDate(selectedDate);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 24 }).map((_, hour) => {
            const time = `${hour.toString().padStart(2, '0')}:00`;
            const blocks = timeBlocks.filter(block => {
              const blockStart = parseInt(block.startTime.split(':')[0]);
              const blockEnd = parseInt(block.endTime.split(':')[0]);
              return hour >= blockStart && hour < blockEnd;
            });
            const hourTasks = tasks.filter(task => {
              if (!task.dueDate) return false;
              const taskHour = task.dueDate.getHours();
              return taskHour === hour;
            });

            return (
              <div key={hour} className="relative border-b p-2">
                <div className="absolute -left-12 top-2 text-sm text-gray-500">
                  {time}
                  </div>
                <div className="ml-12">
                  {blocks.map(block => (
                    <div
                      key={block.id}
                      className="mb-2 p-2 rounded"
                      style={{
                        backgroundColor: block.color + '20',
                        borderLeft: `4px solid ${block.color}`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{block.title}</span>
                        <span className="text-sm text-gray-500">
                          {block.startTime} - {block.endTime}
                        </span>
                  </div>
                </div>
                  ))}
                  {hourTasks.map(task => (
                    <div
                      key={task.id}
                      className="mb-2 p-2 rounded bg-white shadow"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTodo(task.id)}
                          className="h-4 w-4"
                        />
                        <span className={task.completed ? 'line-through' : ''}>
                          {task.title}
                        </span>
                        <PriorityFlag priority={task.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCategoryDropdown = () => (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
      <div className="p-1 max-h-60 overflow-y-auto">
        {categories.map(category => (
          <div
            key={category.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setNewTodoCategory(category.id);
              setShowCategoryDropdown(false);
            }}
          >
            <div className="flex items-center gap-2">
              <span>{category.icon}</span>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
            </div>
            <div className="flex-1">
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-500">{category.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewTaskForm = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
      <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
                <Input
              id="title"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Enter task title"
            />
              </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Due Date</Label>
                  <Input
                id="date"
                    type="date"
                    value={newTodoDate}
                    onChange={(e) => setNewTodoDate(e.target.value)}
                  />
                </div>
            <div>
              <Label htmlFor="time">Due Time</Label>
                  <Input
                id="time"
                    type="time"
                    value={newTodoTime}
                    onChange={(e) => setNewTodoTime(e.target.value)}
                  />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newTodoCategory} onValueChange={setNewTodoCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTodoPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTodoPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
                </div>

          {/* Time Block Section */}
          <TimeBlockSelector
            timeBlock={newTodoTimeBlock}
            onTimeBlockChange={setNewTodoTimeBlock}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                setShowNewTaskDialog(true);
              }}
            >
              Add Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTimeBasedStats = () => {
    const timeSlots = [
      { key: 'morning', label: 'Morning', icon: Sun },
      { key: 'afternoon', label: 'Afternoon', icon: Sun },
      { key: 'evening', label: 'Evening', icon: Moon },
      { key: 'night', label: 'Night', icon: Moon }
    ] as const;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Time-based Statistics</h3>
            <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeSlots.map(({ key, label, icon: Icon }) => {
              const stats = timeBasedStats[key as keyof TimeBasedStats];
              const trend = stats.trend;
              const trendColor = trend.direction === 'up' ? 'text-green-500' : 
                               trend.direction === 'down' ? 'text-red-500' : 
                               'text-gray-500';

              return (
                <Card key={key} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{label}</span>
                      </div>
                    <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                      {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                      {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                      {trend.direction === 'stable' && <Minus className="h-4 w-4" />}
                      <span>{trend.percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{stats.completionRate.toFixed(1)}%</span>
                      </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                  </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-medium">{stats.completed}/{stats.total}</span>
                </div>
              </div>
          </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <Button
          onClick={() => setShowNewTaskDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          New Task
        </Button>
      </div>

      {/* New Task Modal */}
      {showNewTaskDialog && (
        <TaskDialog
          isOpen={showNewTaskDialog}
          onClose={() => setShowNewTaskDialog(false)}
          onSave={handleAddTodo}
          categories={categories}
        />
      )}

      <div className="flex gap-4">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          List View
        </Button>
        <Button
          variant={view === 'planner' ? 'default' : 'outline'}
          onClick={() => setView('planner')}
        >
          Planner View
        </Button>
        <Button
          variant={view === 'analytics' ? 'default' : 'outline'}
          onClick={() => setView('analytics')}
        >
          Analytics
        </Button>
      </div>

      {view === 'list' && renderListView()}
      {view === 'planner' && renderPlannerView()}
      {view === 'analytics' && renderTimeBasedStats()}
    </div>
  );
} 