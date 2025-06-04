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
  Activity
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, subDays, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart as RechartsLineChart, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Line, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
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

type SortField = 'priority' | 'dueDate' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface TimeBasedData {
  date: string;
  completed: number;
  created: number;
  completionRate: number;
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
      created: number;
      completionRate: number;
    };
  }>;
  label?: string;
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

// Add data version and validation
const DATA_VERSION = '1.0';

interface StoredData {
  version: string;
  todos: Todo[];
  categories: Category[];
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

interface TimeBasedStats {
  morning: {
    completed: number;
    total: number;
    completionRate: number;
    trend: {
      change: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  afternoon: {
    completed: number;
    total: number;
    completionRate: number;
    trend: {
      change: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  evening: {
    completed: number;
    total: number;
    completionRate: number;
    trend: {
      change: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  night: {
    completed: number;
    total: number;
    completionRate: number;
    trend: {
      change: number;
      direction: 'up' | 'down' | 'stable';
    };
  };
  prediction?: {
    nextPeriod: number;
    confidence: number;
    factors: string[];
  };
}

interface TimeBasedChartData {
  name: string;
  completed: number;
  total: number;
  completionRate: number;
  previousRate: number;
  trend: {
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  prediction?: {
    nextPeriod: number;
    confidence: number;
    factors: string[];
  };
  color: string;
}

export default function Todo() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos).map((todo: ParsedTodo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
        return parsedTodos;
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');
  const [newTodoTime, setNewTodoTime] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
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
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories).map((category: ParsedCategory) => ({
          ...category,
          createdAt: new Date(category.createdAt)
        }));
        return parsedCategories;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    return [
      {
        id: 'work',
        name: 'Work',
        color: '#FF5733',
        icon: '💼',
        description: 'Work-related tasks',
        createdAt: new Date()
      },
      {
        id: 'personal',
        name: 'Personal',
        color: '#33FF57',
        icon: '👤',
        description: 'Personal tasks',
        createdAt: new Date()
      },
      {
        id: 'shopping',
        name: 'Shopping',
        color: '#3357FF',
        icon: '🛒',
        description: 'Shopping tasks',
        createdAt: new Date()
      },
      {
        id: 'health',
        name: 'Health',
        color: '#FF33A8',
        icon: '❤️',
        description: 'Health and fitness tasks',
        createdAt: new Date()
      },
      {
        id: 'study',
        name: 'Study',
        color: '#A833FF',
        icon: '📚',
        description: 'Study and learning tasks',
        createdAt: new Date()
      }
    ];
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [view, setView] = useState<'list' | 'analytics' | 'planner'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    morning: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
    afternoon: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
    evening: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
    night: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } }
  });
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [showPredictions, setShowPredictions] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'previous' | 'custom'>('previous');

  const priorityColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  const priorityIcons = {
    low: '🔵',
    medium: '🟡',
    high: '🔴'
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

  const addTodo = () => {
    if (newTodo.trim()) {
      const dueDate = newTodoDate && newTodoTime 
        ? new Date(`${newTodoDate}T${newTodoTime}`)
        : undefined;

      const todo: Todo = {
        id: Date.now().toString(),
        title: newTodo,
        completed: false,
        priority: newTodoPriority,
        category: newTodoCategory || undefined,
        dueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setTodos(prevTodos => [...prevTodos, todo]);
      setNewTodo('');
      setNewTodoDate('');
      setNewTodoTime('');
      setNewTodoCategory('');
      setNewTodoPriority('medium');
      setShowNewTaskForm(false);

      // Show success notification with priority-based styling
      const priorityColors = {
        high: 'bg-red-100 border-red-500 text-red-700',
        medium: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        low: 'bg-blue-100 border-blue-500 text-blue-700'
      };

      toast.success('Task created successfully!', {
        description: `"${todo.title}" has been added to your tasks.`,
        duration: 4000,
        className: priorityColors[todo.priority],
        icon: priorityIcons[todo.priority],
      });
    } else {
      toast.error('Failed to create task', {
        description: 'Task title cannot be empty.',
        duration: 3000,
      });
    }
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

  const getTimeBasedStats = (period: 'day' | 'week' | 'month' | 'year'): TimeBasedData[] => {
    const now = new Date();
    let startDate: Date;
    let interval: number;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        interval = 1; // 1 hour intervals
        break;
      case 'week':
        startDate = startOfWeek(now);
        interval = 1; // 1 day intervals
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        interval = 1; // 1 day intervals
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        interval = 30; // 30 day intervals
        break;
    }

    const data: TimeBasedData[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      const nextDate = new Date(currentDate);
      if (period === 'day') {
        nextDate.setHours(currentDate.getHours() + interval);
      } else {
        nextDate.setDate(currentDate.getDate() + interval);
      }

      const completedTasks = todos.filter(todo => 
        todo.completed && 
        todo.updatedAt >= currentDate && 
        todo.updatedAt < nextDate
      ).length;

      const createdTasks = todos.filter(todo => 
        todo.createdAt >= currentDate && 
        todo.createdAt < nextDate
      ).length;

      data.push({
        date: format(currentDate, period === 'day' ? 'HH:mm' : 'MMM dd'),
        completed: completedTasks,
        created: createdTasks,
        completionRate: createdTasks > 0 ? (completedTasks / createdTasks) * 100 : 0
      });

      currentDate = nextDate;
    }

    return data;
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
    const currentCreated = currentData.reduce((sum, item) => sum + (item.created || 0), 0);
    const previousCreated = previousData.reduce((sum, item) => sum + (item.created || 0), 0);

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
      const completed = payload[0].value as number;
      const created = payload[1]?.value as number;
      const rate = created > 0 ? Math.round((completed / created) * 100) : 0;

      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-blue-500">Completed: {completed}</p>
          <p className="text-gray-500">Created: {created}</p>
          <p className="text-green-500">Rate: {rate}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCompletionRateTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const rate = Math.round(payload[0].value as number);
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-green-500">Completion Rate: {rate}%</p>
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
          <option value="createdAt">Created At</option>
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
            "transition-all duration-200 hover:shadow-md",
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
                        <span className="text-sm text-muted-foreground">
                          {format(todo.dueDate, 'h:mm a')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Created {format(todo.createdAt, 'MMM d, yyyy')}
                    </span>
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

  const calculateTimeBasedStats = (period: 'day' | 'week' | 'month' | 'year') => {
    const stats: TimeBasedStats = {
      morning: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
      afternoon: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
      evening: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } },
      night: { completed: 0, total: 0, completionRate: 0, trend: { change: 0, direction: 'stable' } }
    };

    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    // Calculate date ranges based on period
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        previousStartDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = startOfWeek(now);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
    }

    // Calculate current period stats
    const currentPeriodTodos = todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate >= startDate && todo.dueDate <= now;
    });

    // Calculate previous period stats for comparison
    const previousPeriodTodos = todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate >= previousStartDate && todo.dueDate < startDate;
    });

    // Process current period todos
    currentPeriodTodos.forEach(todo => {
      if (!todo.dueDate) return;
      const hour = todo.dueDate.getHours();
      let timeSlot: keyof TimeBasedStats;

      if (hour >= 5 && hour < 12) {
        timeSlot = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeSlot = 'afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeSlot = 'evening';
      } else {
        timeSlot = 'night';
      }

      stats[timeSlot].total++;
      if (todo.completed) {
        stats[timeSlot].completed++;
      }
    });

    // Calculate completion rates and trends
    Object.keys(stats).forEach((key) => {
      const slot = key as keyof TimeBasedStats;
      const currentRate = stats[slot].total > 0 
        ? (stats[slot].completed / stats[slot].total) * 100 
        : 0;

      // Calculate previous period stats for this time slot
      const previousCompleted = previousPeriodTodos.filter(todo => {
        if (!todo.dueDate) return false;
        const hour = todo.dueDate.getHours();
        return (
          (slot === 'morning' && hour >= 5 && hour < 12) ||
          (slot === 'afternoon' && hour >= 12 && hour < 17) ||
          (slot === 'evening' && hour >= 17 && hour < 22) ||
          (slot === 'night' && (hour >= 22 || hour < 5))
        ) && todo.completed;
      }).length;

      const previousTotal = previousPeriodTodos.filter(todo => {
        if (!todo.dueDate) return false;
        const hour = todo.dueDate.getHours();
        return (
          (slot === 'morning' && hour >= 5 && hour < 12) ||
          (slot === 'afternoon' && hour >= 12 && hour < 17) ||
          (slot === 'evening' && hour >= 17 && hour < 22) ||
          (slot === 'night' && (hour >= 22 || hour < 5))
        );
      }).length;

      const previousRate = previousTotal > 0 
        ? (previousCompleted / previousTotal) * 100 
        : 0;

      stats[slot].completionRate = currentRate;
      stats[slot].trend = {
        change: previousRate === 0 ? 100 : ((currentRate - previousRate) / previousRate) * 100,
        direction: currentRate > previousRate ? 'up' : currentRate < previousRate ? 'down' : 'stable'
      };
    });

    setTimeBasedStats(stats);
  };

  // Update useEffect to include period-based calculation
  useEffect(() => {
    calculateTimeBasedStats(selectedPeriod);
  }, [todos, selectedPeriod]);

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
    const stats = getProductivityStats();
    const timeBasedData = getTimeBasedStats(selectedPeriod);
    const detailedStats = getDetailedStats(selectedPeriod);

    const timeBasedChartData: TimeBasedChartData[] = [
      {
        name: 'Morning',
        completed: timeBasedStats.morning.completed,
        total: timeBasedStats.morning.total,
        completionRate: timeBasedStats.morning.completionRate,
        previousRate: timeBasedStats.morning.trend.change,
        trend: timeBasedStats.morning.trend,
        prediction: calculatePrediction(
          timeBasedStats.morning.completed,
          timeBasedStats.morning.total - timeBasedStats.morning.completed,
          selectedPeriod
        ),
        color: '#3B82F6' // blue
      },
      {
        name: 'Afternoon',
        completed: timeBasedStats.afternoon.completed,
        total: timeBasedStats.afternoon.total,
        completionRate: timeBasedStats.afternoon.completionRate,
        previousRate: timeBasedStats.afternoon.trend.change,
        trend: timeBasedStats.afternoon.trend,
        prediction: calculatePrediction(
          timeBasedStats.afternoon.completed,
          timeBasedStats.afternoon.total - timeBasedStats.afternoon.completed,
          selectedPeriod
        ),
        color: '#F59E0B' // amber
      },
      {
        name: 'Evening',
        completed: timeBasedStats.evening.completed,
        total: timeBasedStats.evening.total,
        completionRate: timeBasedStats.evening.completionRate,
        previousRate: timeBasedStats.evening.trend.change,
        trend: timeBasedStats.evening.trend,
        prediction: calculatePrediction(
          timeBasedStats.evening.completed,
          timeBasedStats.evening.total - timeBasedStats.evening.completed,
          selectedPeriod
        ),
        color: '#8B5CF6' // purple
      },
      {
        name: 'Night',
        completed: timeBasedStats.night.completed,
        total: timeBasedStats.night.total,
        completionRate: timeBasedStats.night.completionRate,
        previousRate: timeBasedStats.night.trend.change,
        trend: timeBasedStats.night.trend,
        prediction: calculatePrediction(
          timeBasedStats.night.completed,
          timeBasedStats.night.total - timeBasedStats.night.completed,
          selectedPeriod
        ),
        color: '#1F2937' // gray
      }
    ];

    const getTrendIcon = (trend: { direction: 'up' | 'down' | 'stable' }) => {
      switch (trend.direction) {
        case 'up':
          return '↑';
        case 'down':
          return '↓';
        default:
          return '→';
      }
    };

    const getTrendColor = (trend: { direction: 'up' | 'down' | 'stable' }) => {
      switch (trend.direction) {
        case 'up':
          return 'text-green-500';
        case 'down':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Period Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('day')}
              >
                Day
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('year')}
              >
                Year
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPredictions(!showPredictions)}
                className={cn(showPredictions && "bg-primary/10")}
              >
                <Activity className="w-4 h-4 mr-2" />
                {showPredictions ? 'Hide Predictions' : 'Show Predictions'}
              </Button>
              <Button
                variant="outline"
                onClick={exportAnalyticsData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-[300px]"
              />
            </div>
            <Select
              value={comparisonMode}
              onValueChange={(value: 'previous' | 'custom') => setComparisonMode(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Comparison Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Previous Period</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparative Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Period Comparison</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={timeBasedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completionRate" name="Current Period" fill="#8884d8">
                      {timeBasedChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar dataKey="previousRate" name="Previous Period" fill="#82ca9d">
                      {timeBasedChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.5} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Predictions */}
          {showPredictions && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Performance Predictions</h3>
                <div className="space-y-4">
                  {timeBasedChartData.map((data) => (
                    <div key={data.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-medium">{data.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "flex items-center gap-1 text-sm",
                            data.trend.direction === 'up' ? "text-green-500" : "text-red-500"
                          )}>
                            {data.trend.direction === 'up' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>Predicted: {data.prediction?.nextPeriod || 0} tasks</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${data.prediction?.confidence * 100 || 0}%`,
                            backgroundColor: data.color
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round((data.prediction?.confidence || 0) * 100)}%
                        {data.prediction?.factors.map((factor, index) => (
                          <div key={index} className="mt-1">• {factor}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Existing Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time-based Task Distribution */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Task Distribution by Time of Day</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={timeBasedChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                    >
                      {timeBasedChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{data.name}</p>
                              <p style={{ color: data.color }}>
                                Tasks: {data.total}
                              </p>
                              <p className="text-muted-foreground">
                                {Math.round((data.total / stats.totalTasks) * 100)}% of total
                              </p>
                              <p className={getTrendColor(data.trend)}>
                                Trend: {getTrendIcon(data.trend)} {Math.abs(data.trend.change).toFixed(1)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time-based Productivity Insights */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Productivity Insights</h3>
              <div className="space-y-4">
                {timeBasedChartData.map((data) => (
                  <div key={data.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="font-medium">{data.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {data.completed} / {data.total} tasks
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          getTrendColor(data.trend)
                        )}>
                          <span>{getTrendIcon(data.trend)}</span>
                          <span>{Math.abs(data.trend.change).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${data.completionRate}%`,
                          backgroundColor: data.color
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completion Rate: {data.completionRate.toFixed(1)}%</span>
                      <span>
                        {data.completionRate > 75 ? 'Excellent' :
                         data.completionRate > 50 ? 'Good' :
                         data.completionRate > 25 ? 'Fair' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Completion Trend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Task Completion Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={timeBasedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={renderChartTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#3B82F6" 
                    name="Completed Tasks"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#9CA3AF" 
                    name="Created Tasks"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Trend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Completion Rate Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={timeBasedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={renderCompletionRateTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    name="Completion Rate (%)"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Tasks by Priority</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'High', value: stats.byPriority.high, color: '#EF4444' },
                      { name: 'Medium', value: stats.byPriority.medium, color: '#EAB308' },
                      { name: 'Low', value: stats.byPriority.low, color: '#3B82F6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'High', value: stats.byPriority.high, color: '#EF4444' },
                      { name: 'Medium', value: stats.byPriority.medium, color: '#EAB308' },
                      { name: 'Low', value: stats.byPriority.low, color: '#3B82F6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name} Priority</p>
                            <p style={{ color: data.color }}>
                              Tasks: {data.value}
                            </p>
                            <p className="text-muted-foreground">
                              {Math.round((data.value / stats.totalTasks) * 100)}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Tasks by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={categories.map(category => ({
                  name: category.name,
                  value: stats.byCategory[category.id] || 0,
                  color: category.color
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p style={{ color: data.color }}>
                              Tasks: {data.value}
                            </p>
                            <p className="text-muted-foreground">
                              {Math.round((data.value / stats.totalTasks) * 100)}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Tasks">
                    {categories.map((category, index) => (
                      <Cell key={`cell-${index}`} fill={category.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getTasksForDate = (date: Date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const matchesDate = isSameDay(todo.dueDate, date);
      const matchesFilter = plannerFilter === 'all' || 
        (plannerFilter === 'active' && !todo.completed) || 
        (plannerFilter === 'completed' && todo.completed);
      const matchesSearch = todo.title.toLowerCase().includes(plannerSearch.toLowerCase()) ||
        todo.notes?.toLowerCase().includes(plannerSearch.toLowerCase());
      return matchesDate && matchesFilter && matchesSearch;
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

  const renderPlannerView = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(today) });

    return (
      <div className="space-y-6">
        {/* Planner Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = addDays(weekStart, -7);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(weekStart, 'MMMM d')} - {format(endOfWeek(today), 'MMMM d, yyyy')}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = addDays(weekStart, 7);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={plannerView === 'week' ? 'default' : 'outline'}
                onClick={() => setPlannerView('week')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Week
              </Button>
              <Button
                variant={plannerView === 'month' ? 'default' : 'outline'}
                onClick={() => setPlannerView('month')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Month
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(today)}
              >
                Today
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={plannerSearch}
                onChange={(e) => setPlannerSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={plannerFilter}
              onValueChange={(value: 'all' | 'active' | 'completed') => setPlannerFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active Tasks</SelectItem>
                <SelectItem value="completed">Completed Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Week Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((date, index) => {
              const isToday = isSameDay(date, today);
              const tasks = getTasksForDate(date);
              const { morning, afternoon, evening } = getTasksByTime(tasks);
              const stats = getTaskStats(date);

              return (
                <Card key={date.toISOString()} className={cn(
                  "min-h-[400px]",
                  isToday && "ring-2 ring-primary"
                )}>
                  <CardContent className="p-4">
                    {/* Date Header with Stats */}
                    <div className={cn(
                      "text-center mb-4 pb-2 border-b",
                      isToday && "text-primary font-semibold"
                    )}>
                      <div className="text-sm text-muted-foreground">
                        {format(date, 'EEE')}
                      </div>
                      <div className={cn(
                        "text-lg",
                        isToday && "text-primary"
                      )}>
                        {format(date, 'd')}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <BarChart className="h-3 w-3" />
                          <span>{stats.completionRate.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3 text-red-500" />
                          <span>{stats.highPriority}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tasks by Time of Day */}
                    <div className="space-y-4">
                      {/* Morning Tasks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sun className="h-4 w-4" />
                          <span>Morning</span>
                          <span className="text-xs">({morning.length})</span>
                        </div>
                        <Droppable droppableId={`${date.toISOString()}-morning`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {morning.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "p-2 rounded text-sm cursor-pointer transition-colors group",
                                        task.completed 
                                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                                          : "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30",
                                        task.priority === 'high' && "border-l-2 border-l-red-500",
                                        task.priority === 'medium' && "border-l-2 border-l-yellow-500",
                                        task.priority === 'low' && "border-l-2 border-l-blue-500"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <Checkbox
                                          checked={task.completed}
                                          onCheckedChange={() => toggleTodo(task.id)}
                                          className="h-4 w-4"
                                        />
                                        <span 
                                          className={cn(
                                            "truncate",
                                            task.completed && "line-through"
                                          )}
                                          onClick={() => startEditing(task)}
                                        >
                                          {task.title}
                                        </span>
                                      </div>
                                      {task.category && (
                                        <div className="flex items-center gap-1 mt-1 text-xs">
                                          <span>{categories.find(c => c.id === task.category)?.icon}</span>
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: categories.find(c => c.id === task.category)?.color }}
                                          />
                                          <span className="text-muted-foreground">
                                            {categories.find(c => c.id === task.category)?.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>

                      {/* Afternoon Tasks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sun className="h-4 w-4" />
                          <span>Afternoon</span>
                          <span className="text-xs">({afternoon.length})</span>
                        </div>
                        <Droppable droppableId={`${date.toISOString()}-afternoon`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {afternoon.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "p-2 rounded text-sm cursor-pointer transition-colors group",
                                        task.completed 
                                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                                          : "bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30",
                                        task.priority === 'high' && "border-l-2 border-l-red-500",
                                        task.priority === 'medium' && "border-l-2 border-l-yellow-500",
                                        task.priority === 'low' && "border-l-2 border-l-blue-500"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <Checkbox
                                          checked={task.completed}
                                          onCheckedChange={() => toggleTodo(task.id)}
                                          className="h-4 w-4"
                                        />
                                        <span 
                                          className={cn(
                                            "truncate",
                                            task.completed && "line-through"
                                          )}
                                          onClick={() => startEditing(task)}
                                        >
                                          {task.title}
                                        </span>
                                      </div>
                                      {task.category && (
                                        <div className="flex items-center gap-1 mt-1 text-xs">
                                          <span>{categories.find(c => c.id === task.category)?.icon}</span>
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: categories.find(c => c.id === task.category)?.color }}
                                          />
                                          <span className="text-muted-foreground">
                                            {categories.find(c => c.id === task.category)?.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>

                      {/* Evening Tasks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Moon className="h-4 w-4" />
                          <span>Evening</span>
                          <span className="text-xs">({evening.length})</span>
                        </div>
                        <Droppable droppableId={`${date.toISOString()}-evening`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {evening.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "p-2 rounded text-sm cursor-pointer transition-colors group",
                                        task.completed 
                                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                                          : "bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30",
                                        task.priority === 'high' && "border-l-2 border-l-red-500",
                                        task.priority === 'medium' && "border-l-2 border-l-yellow-500",
                                        task.priority === 'low' && "border-l-2 border-l-blue-500"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <Checkbox
                                          checked={task.completed}
                                          onCheckedChange={() => toggleTodo(task.id)}
                                          className="h-4 w-4"
                                        />
                                        <span 
                                          className={cn(
                                            "truncate",
                                            task.completed && "line-through"
                                          )}
                                          onClick={() => startEditing(task)}
                                        >
                                          {task.title}
                                        </span>
                                      </div>
                                      {task.category && (
                                        <div className="flex items-center gap-1 mt-1 text-xs">
                                          <span>{categories.find(c => c.id === task.category)?.icon}</span>
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: categories.find(c => c.id === task.category)?.color }}
                                          />
                                          <span className="text-muted-foreground">
                                            {categories.find(c => c.id === task.category)?.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DragDropContext>
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'analytics' ? 'default' : 'outline'}
            onClick={() => setView('analytics')}
          >
            Analytics
          </Button>
          <Button
            variant={view === 'planner' ? 'default' : 'outline'}
            onClick={() => setView('planner')}
          >
            Planner
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {!showNewTaskForm ? (
          <Button onClick={() => setShowNewTaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Task title..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addTodo}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
                <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                  Cancel
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTodoDate}
                    onChange={(e) => setNewTodoDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newTodoTime}
                    onChange={(e) => setNewTodoTime(e.target.value)}
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
                      {newTodoCategory ? (
                        <div className="flex items-center gap-2">
                          <span>{categories.find(c => c.id === newTodoCategory)?.icon}</span>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categories.find(c => c.id === newTodoCategory)?.color || '#ccc' }}
                          />
                          {categories.find(c => c.id === newTodoCategory)?.name || 'Select Category'}
                        </div>
                      ) : (
                        'Select Category'
                      )}
                      <span className="ml-2">▼</span>
                    </Button>
                    {showCategoryDropdown && renderCategoryDropdown()}
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label>Priority</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full justify-between ${priorityColors[newTodoPriority]}`}
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{priorityIcons[newTodoPriority]}</span>
                        {newTodoPriority.charAt(0).toUpperCase() + newTodoPriority.slice(1)}
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
                                setNewTodoPriority(priority);
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
            </CardContent>
          </Card>
        )}
      </div>

      {view === 'list' && renderListView()}
      {view === 'analytics' && renderAnalyticsView()}
      {view === 'planner' && renderPlannerView()}
    </div>
  );
} 