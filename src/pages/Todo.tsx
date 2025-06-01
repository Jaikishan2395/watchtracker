import { useState, useEffect, useRef } from 'react';
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
  CalendarDays, 
  Mic, 
  MicOff, 
  Timer, 
  Lock, 
  Unlock, 
  FolderPlus, 
  FolderEdit, 
  FolderMinus,
  LineChart,
  PieChart,
  Activity,
  Users,
  UserPlus,
  MoreVertical,
  Settings,
  PinOff,
  Edit,
  Pin,
  Phone,
  PhoneOff,
  Square,
  Upload,
  X,
  Paperclip,
  Video,
  UserMinus,
  BarChart,
  Megaphone,
  Smile,
  Hash,
  Send,
  UserCircle,
  Shield,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  format, 
  addDays, 
  addWeeks, 
  addMonths, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addMinutes,
  differenceInMinutes
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

// Add type declarations for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

// Fix: Add SpeechRecognitionConstructor type
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  reminder?: Date;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  goalId?: string;
  focusTime?: number; // in minutes
  isLocked?: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  progress: number;
  subtasks: string[]; // Array of todo IDs
}

interface SavedTodo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  reminder?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: Date;
}

// Add new interfaces for study planning
interface StudySession {
  id: string;
  title: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    days?: number[]; // For custom recurring sessions
  };
  category: string;
  color: string;
  isPrivate: boolean;
  participants?: string[];
  resources?: {
    type: 'pdf' | 'video' | 'link' | 'note' | 'quiz' | 'assignment';
    url: string;
    title: string;
    description?: string;
    tags?: string[];
  }[];
  mentorId?: string;
  sharedPlanId?: string;
  timeBlock?: {
    type: 'focus' | 'review' | 'break' | 'group';
    duration: number; // in minutes
  };
  timeBlocks?: {
    id: string;
    type: 'focus' | 'review' | 'break' | 'group';
    duration: number;
    startTime: Date;
    endTime: Date;
    subject: string;
    description?: string;
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: Date;
}

// Add new interfaces after the existing interfaces
interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  availability: {
    days: number[];
    timeSlots: { start: string; end: string }[];
  };
  hourlyRate: number;
  bio: string;
  image?: string;
}

interface SharedPlan {
  id: string;
  title: string;
  owner: string;
  participants: string[];
  sessions: StudySession[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Add new interfaces for enhanced features
interface StudyProgress {
  sessionId: string;
  completed: boolean;
  notes?: string;
  timeSpent: number; // in minutes
  rating?: number;
  feedback?: string;
}

interface TimeBlock {
  id: string;
  type: 'focus' | 'review' | 'break' | 'group';
  duration: number;
  startTime: Date;
  endTime: Date;
  subject: string;
  description?: string;
  completed: boolean;
}

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface StudyResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note' | 'quiz' | 'assignment';
  url: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Add new interfaces for enhanced features
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'session' | 'reminder' | 'achievement' | 'resource';
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
}

// Add new interface for enhanced template structure
interface StudyTemplate {
  id: string;
  title: string;
  description?: string;
  duration: number;
  subject: string;
  timeBlocks: {
    type: 'focus' | 'review' | 'break' | 'group';
    duration: number;
    description?: string;
    order: number;
  }[];
  resources?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  recommendedFor?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

// Add new interfaces for class management
interface Class {
  id: string;
  name: string;
  description?: string;
  subject: string;
  code: string;
  teachers: string[];
  students: string[];
  createdAt: Date;
  updatedAt: Date;
  schedule?: {
    day: number;
    startTime: string;
    endTime: string;
  }[];
  settings?: {
    allowStudentInvites: boolean;
    requireApproval: boolean;
    allowFileSharing: boolean;
  };
}

interface Assignment {
  id: string;
  classId: string;
  title: string;
  description?: string;
  type: 'assignment' | 'quiz' | 'question';
  dueDate?: Date;
  points?: number;
  status: 'draft' | 'published' | 'graded';
  questions?: Question[];
  submissions?: Submission[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer' | 'file-upload';
  text: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  required: boolean;
}

interface Submission {
  id: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string;
    files?: string[];
  }[];
  submittedAt: Date;
  gradedAt?: Date;
  grade?: number;
  feedback?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  classes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const priorityColors = {
  low: 'text-blue-500',
  medium: 'text-yellow-500',
  high: 'text-red-500'
};

const categories = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Education',
  'Other'
];

type SortField = 'priority' | 'dueDate' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

// Add new interfaces for resource management
interface ResourceTag {
  id: string;
  name: string;
  color: string;
}

// Add template categories
type TemplateCategory = 'focus' | 'review' | 'exam' | 'group' | 'language' | 'project' | 'research';

interface Attachment {
  id: string;
  type: 'drive' | 'youtube' | 'link' | 'upload';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: Date;
}

interface Rubric {
  id: string;
  name: string;
  criteria: {
    name: string;
    description: string;
    points: number;
  }[];
  totalPoints: number;
}

interface Grade {
  id: string;
  assignmentId: string;
  studentId: string;
  points: number;
  maxPoints: number;
  rubric?: {
    criteriaId: string;
    points: number;
  }[];
  feedback: string;
  privateComments?: string;
  gradedBy: string;
  gradedAt: Date;
}

interface Message {
  id: string;
  classId: string;
  senderId: string;
  content: string;
  type: 'announcement' | 'discussion' | 'question';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  reactions?: {
    userId: string;
    type: string;
  }[];
  replies?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
  }[];
}

interface GradebookEntry {
  studentId: string;
  assignments: {
    assignmentId: string;
    grade: number;
    maxPoints: number;
    submittedAt: Date;
    gradedAt: Date;
  }[];
  average: number;
  totalPoints: number;
  maxTotalPoints: number;
}

// Update the ChatRoom interface with more features
interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'class' | 'study' | 'group' | 'private';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    lastSeen?: Date;
    status?: 'online' | 'offline' | 'away';
    customTitle?: string;
    permissions?: {
      canInvite: boolean;
      canPin: boolean;
      canDelete: boolean;
      canEdit: boolean;
      canMute: boolean;
    };
  }[];
  settings: {
    isPrivate: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowVideoCalls: boolean;
    allowReactions: boolean;
    allowPolls: boolean;
    allowThreading: boolean;
    slowMode?: number; // seconds between messages
    maxParticipants?: number;
    autoArchive?: boolean;
    archiveAfter?: number; // days
    welcomeMessage?: string;
    rules?: string[];
  };
  pinnedMessages?: string[];
  topics?: {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    createdAt: Date;
    isLocked?: boolean;
    isAnnouncement?: boolean;
  }[];
  polls?: {
    id: string;
    question: string;
    options: {
      id: string;
      text: string;
      votes: string[]; // user IDs
    }[];
    createdBy: string;
    createdAt: Date;
    endsAt?: Date;
    isMultipleChoice?: boolean;
    isAnonymous?: boolean;
  }[];
  roles?: {
    name: string;
    color: string;
    permissions: {
      canInvite: boolean;
      canPin: boolean;
      canDelete: boolean;
      canEdit: boolean;
      canMute: boolean;
    };
  }[];
  customEmojis?: {
    id: string;
    name: string;
    url: string;
    createdBy: string;
  }[];
  announcements?: {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    expiresAt?: Date;
  }[];
}

interface RoomInvite {
  id: string;
  roomId: string;
  invitedBy: string;
  invitedUser: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

interface RoomMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'announcement' | 'discussion' | 'question';
  topicId?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  isEdited?: boolean;
  editHistory?: {
    content: string;
    editedAt: Date;
    editedBy: string;
  }[];
  mentions?: string[];
  tags?: string[];
  reactions?: {
    userId: string;
    type: string;
  }[];
  replies?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
  }[];
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsed: SavedTodo[] = JSON.parse(savedTodos);
      return parsed.map(todo => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        reminder: todo.reminder ? new Date(todo.reminder) : undefined,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }));
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [view, setView] = useState<'list' | 'planner' | 'analytics' | 'study' | 'classes'>('list');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: undefined as Date | undefined });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTimer, setFocusTimer] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'work', name: 'Work', color: 'text-blue-500', createdAt: new Date() },
    { id: 'personal', name: 'Personal', color: 'text-green-500', createdAt: new Date() },
    { id: 'shopping', name: 'Shopping', color: 'text-yellow-500', createdAt: new Date() },
    { id: 'health', name: 'Health', color: 'text-red-500', createdAt: new Date() },
    { id: 'education', name: 'Education', color: 'text-purple-500', createdAt: new Date() },
  ]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    color: 'text-blue-500',
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'math', name: 'Mathematics', color: '#3b82f6', createdAt: new Date() },
    { id: 'coding', name: 'Programming', color: '#10b981', createdAt: new Date() },
    { id: 'language', name: 'Languages', color: '#f59e0b', createdAt: new Date() },
    { id: 'science', name: 'Science', color: '#ef4444', createdAt: new Date() },
    { id: 'other', name: 'Other', color: '#8b5cf6', createdAt: new Date() },
  ]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [newStudySession, setNewStudySession] = useState<Partial<StudySession>>({
    title: '',
    subject: '',
    startTime: new Date(),
    endTime: new Date(),
    category: '',
    color: '',
    isPrivate: false,
  });
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      expertise: ['Mathematics', 'Physics'],
      rating: 4.8,
      availability: {
        days: [1, 2, 3, 4, 5],
        timeSlots: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ]
      },
      hourlyRate: 50,
      bio: 'Experienced mathematics professor with 10+ years of teaching experience.'
    }
  ]);
  const [sharedPlans, setSharedPlans] = useState<SharedPlan[]>([]);
  const [showMentorBooking, setShowMentorBooking] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showSharedPlanForm, setShowSharedPlanForm] = useState(false);
  const [newSharedPlan, setNewSharedPlan] = useState<Partial<SharedPlan>>({
    title: '',
    isPublic: false,
    participants: []
  });
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true
  });
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(pomodoroSettings.focusDuration * 60);
  const [studyResources, setStudyResources] = useState<StudyResource[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState<Partial<StudyResource>>({
    title: '',
    type: 'note',
    url: '',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [studyTemplates, setStudyTemplates] = useState<StudyTemplate[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<StudyTemplate>>({
    title: '',
    duration: 60,
    subject: '',
    timeBlocks: []
  });
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [selectedResourceTags, setSelectedResourceTags] = useState<string[]>([]);
  const [resourceTags, setResourceTags] = useState<ResourceTag[]>([
    { id: 'important', name: 'Important', color: '#ef4444' },
    { id: 'reference', name: 'Reference', color: '#3b82f6' },
    { id: 'practice', name: 'Practice', color: '#10b981' },
    { id: 'theory', name: 'Theory', color: '#f59e0b' },
  ]);
  const [showResourceTagForm, setShowResourceTagForm] = useState(false);
  const [newResourceTag, setNewResourceTag] = useState<Partial<ResourceTag>>({
    name: '',
    color: '#3b82f6'
  });
  // Add state for template filtering
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<TemplateCategory | 'all'>('all');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');

  // Add new state variables for class management
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [newClass, setNewClass] = useState<Partial<Class>>({
    name: '',
    subject: '',
    settings: {
      allowStudentInvites: true,
      requireApproval: true,
      allowFileSharing: true
    }
  });
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    title: '',
    type: 'assignment',
    status: 'draft'
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'student' | 'teacher'>('student');
  // Add new state variables for enhanced class features
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gradebook, setGradebook] = useState<GradebookEntry[]>([]);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Partial<Attachment>>({});
  const [selectedRubric, setSelectedRubric] = useState<Partial<Rubric>>({});
  const [selectedGrade, setSelectedGrade] = useState<Partial<Grade>>({});
  const [selectedMessage, setSelectedMessage] = useState<Message | RoomMessage | null>(null);
  const [newMessage, setNewMessage] = useState<Partial<Message>>({
    type: 'discussion',
    content: '',
    attachments: []
  });
  const [messageFilter, setMessageFilter] = useState<'all' | 'announcement' | 'discussion' | 'question'>('all');

  // Chat Room Management
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoomSettingsDialog, setShowRoomSettingsDialog] = useState(false);
  const [roomInvites, setRoomInvites] = useState<RoomInvite[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState<Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    type: 'group',
    createdBy: 'current-user',
    participants: [],
    settings: {
      isPrivate: false,
      allowInvites: true,
      requireApproval: false,
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowVideoCalls: true
    }
  });
  const [inviteUser, setInviteUser] = useState('');
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [showEditMessageDialog, setShowEditMessageDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState<RoomMessage | null>(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVoiceMessageDialog, setShowVoiceMessageDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoCallDialog, setShowVideoCallDialog] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [showCreatePollDialog, setShowCreatePollDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [newPoll, setNewPoll] = useState<{
    question: string;
    options: { id: string; text: string; votes: string[] }[];
    isMultipleChoice: boolean;
    isAnonymous: boolean;
    endsAt?: Date;
  }>({
    question: '',
    options: [],
    isMultipleChoice: false,
    isAnonymous: false
  });
  const [newAnnouncement, setNewAnnouncement] = useState<{
    content: string;
    expiresAt?: Date;
  }>({
    content: ''
  });
  const [newEmoji, setNewEmoji] = useState<{
    name: string;
    url: string;
  }>({
    name: '',
    url: ''
  });
  // Add state variables for dialogs
  const [showCreateTopicDialog, setShowCreateTopicDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          setNewTodo(transcript);
        }
      };
    }
  }, []);

  // Generate smart suggestions based on existing tasks
  useEffect(() => {
    const generateSuggestions = () => {
      const commonPatterns = todos.reduce((acc, todo) => {
        const words = todo.title.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 3) {
            acc[word] = (acc[word] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      const suggestions = Object.entries(commonPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      setSuggestions(suggestions);
    };

    generateSuggestions();
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const now = new Date();
      setTodos([...todos, {
        id: Date.now().toString(),
        title: newTodo,
        completed: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    const now = new Date();
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updated = { ...todo, completed: !todo.completed, updatedAt: now };
        if (todo.recurring && todo.completed) {
          // Create next recurring task
          const nextDueDate = getNextRecurringDate(todo.dueDate, todo.recurring);
          if (nextDueDate) {
            setTodos(prev => [...prev, {
              ...todo,
              id: Date.now().toString(),
              completed: false,
              dueDate: nextDueDate,
              createdAt: now,
              updatedAt: now
            }]);
          }
        }
        return updated;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const saveEdit = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, title: editText, updatedAt: new Date() } : todo
    ));
    setEditingId(null);
  };

  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, priority, updatedAt: new Date() } : todo
    ));
  };

  const updateDueDate = (id: string, date: Date | undefined) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, dueDate: date, updatedAt: new Date() } : todo
    ));
  };

  const updateTodoCategory = (id: string, categoryId: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, category: categoryId, updatedAt: new Date() } : todo
    ));
  };

  const updateCategoryDetails = (category: Category) => {
    setCategories(categories.map(c => 
      c.id === category.id ? { ...c, ...category } : c
    ));
    setEditingCategory(null);
  };

  const getNextRecurringDate = (currentDate: Date | undefined, recurring: { type: 'daily' | 'weekly' | 'monthly', interval: number }) => {
    if (!currentDate) return undefined;
    switch (recurring.type) {
      case 'daily':
        return addDays(currentDate, recurring.interval);
      case 'weekly':
        return addWeeks(currentDate, recurring.interval);
      case 'monthly':
        return addMonths(currentDate, recurring.interval);
      default:
        return undefined;
    }
  };

  const setRecurring = (id: string, type: 'daily' | 'weekly' | 'monthly', interval: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, recurring: { type, interval }, updatedAt: new Date() } : todo
    ));
  };

  const updateNotes = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, notes: noteText, updatedAt: new Date() } : todo
    ));
    setShowNotes(null);
    setNoteText('');
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
          comparison = (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0);
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

  const pendingCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  const addGoal = () => {
    if (newGoal.title.trim()) {
      setGoals([...goals, {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        targetDate: newGoal.targetDate,
        progress: 0,
        subtasks: []
      }]);
      setNewGoal({ title: '', description: '', targetDate: undefined });
      setShowGoalForm(false);
    }
  };

  const updateGoalProgress = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const completedSubtasks = goal.subtasks.filter(taskId => {
        const task = todos.find(t => t.id === taskId);
        return task?.completed;
      }).length;
      const progress = goal.subtasks.length > 0 ? (completedSubtasks / goal.subtasks.length) * 100 : 0;
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress } : g));
    }
  };

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
      }), {} as Record<string, number>)
    };

    return stats;
  };

  const getDailyTasks = (date: Date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate.toDateString() === date.toDateString();
    });
  };

  const renderPlannerView = () => {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(selectedDate),
      end: endOfWeek(selectedDate)
    });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          >
            Previous Week
          </Button>
          <h2 className="text-xl font-semibold">
            {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
          </h2>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          >
            Next Week
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => (
            <Card key={day.toISOString()}>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">
                  {format(day, 'EEE')}
                  <br />
                  {format(day, 'MMM d')}
                </div>
                <div className="space-y-2">
                  {getDailyTasks(day).map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-2 rounded text-sm",
                        task.completed ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (view === 'analytics') {
      setAnalyticsLoading(true);
      try {
        // Simulate data loading
        setTimeout(() => {
          setAnalyticsLoading(false);
        }, 500);
      } catch (err) {
        setAnalyticsError('Failed to load analytics data');
        setAnalyticsLoading(false);
      }
    }
  }, [view]);

  const renderAnalyticsView = () => {
    const stats = getProductivityStats();
    const completionRate = stats.daily.total > 0
      ? (stats.daily.completed / stats.daily.total) * 100
      : 0;

    // Theme-aware colors
    const chartColors = {
      primary: theme === 'dark' ? '#8884d8' : '#6366f1',
      secondary: theme === 'dark' ? '#82ca9d' : '#10b981',
      grid: theme === 'dark' ? '#374151' : '#e5e7eb',
      text: theme === 'dark' ? '#e5e7eb' : '#374151',
      tooltip: theme === 'dark' ? '#1f2937' : '#ffffff',
      tooltipText: theme === 'dark' ? '#e5e7eb' : '#374151',
    };

    // Prepare data for charts
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const completionTrendData = last7Days.map(date => {
      const dayTodos = todos.filter(todo => 
        isSameDay(new Date(todo.updatedAt), date)
      );
      return {
        date: format(date, 'MMM dd'),
        completed: dayTodos.filter(t => t.completed).length,
        total: dayTodos.length
      };
    });

    const priorityData = [
      { name: 'High', value: stats.byPriority.high, color: '#ef4444' },
      { name: 'Medium', value: stats.byPriority.medium, color: '#f59e0b' },
      { name: 'Low', value: stats.byPriority.low, color: '#3b82f6' }
    ];

    const categoryData = Object.entries(stats.byCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));

    const dailyPatternData = last7Days.map(date => {
      const dayTodos = todos.filter(todo => 
        isSameDay(new Date(todo.updatedAt), date)
      );
      return {
        date: format(date, 'MMM dd'),
        morning: dayTodos.filter(t => {
          const hour = new Date(t.updatedAt).getHours();
          return hour >= 5 && hour < 12;
        }).length,
        afternoon: dayTodos.filter(t => {
          const hour = new Date(t.updatedAt).getHours();
          return hour >= 12 && hour < 17;
        }).length,
        evening: dayTodos.filter(t => {
          const hour = new Date(t.updatedAt).getHours();
          return hour >= 17 && hour < 22;
        }).length,
        night: dayTodos.filter(t => {
          const hour = new Date(t.updatedAt).getHours();
          return hour >= 22 || hour < 5;
        }).length
      };
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (analyticsError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{analyticsError}</AlertDescription>
        </Alert>
      );
    }

    if (analyticsLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Today's Progress</h3>
              <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">
                {stats.daily.completed} of {stats.daily.total} tasks completed
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Weekly Progress</h3>
              <div className="text-2xl font-bold">
                {stats.weekly.total > 0
                  ? ((stats.weekly.completed / stats.weekly.total) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.weekly.completed} of {stats.weekly.total} tasks completed
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Tasks by Priority</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-500">High</span>
                  <span>{stats.byPriority.high}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">Medium</span>
                  <span>{stats.byPriority.medium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Low</span>
                  <span>{stats.byPriority.low}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Task Completion Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={completionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis 
                      dataKey="date" 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <YAxis 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip,
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: chartColors.tooltipText
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke={chartColors.primary} 
                      name="Completed Tasks"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke={chartColors.secondary} 
                      name="Total Tasks"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tasks by Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Tasks by Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis 
                      dataKey="name" 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <YAxis 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip,
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: chartColors.tooltipText
                      }}
                    />
                    <Bar dataKey="value" fill={chartColors.primary}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tasks by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Tasks by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill={chartColors.primary}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke={chartColors.tooltip}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip,
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: chartColors.tooltipText
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Task Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Daily Task Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dailyPatternData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis 
                      dataKey="date" 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <YAxis 
                      stroke={chartColors.text}
                      tick={{ fill: chartColors.text }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: chartColors.tooltip,
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: chartColors.tooltipText
                      }}
                    />
                    <Legend />
                    <Bar dataKey="morning" stackId="a" fill="#FFBB28" name="Morning (5-12)" />
                    <Bar dataKey="afternoon" stackId="a" fill="#00C49F" name="Afternoon (12-17)" />
                    <Bar dataKey="evening" stackId="a" fill="#FF8042" name="Evening (17-22)" />
                    <Bar dataKey="night" stackId="a" fill="#8884d8" name="Night (22-5)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      // Start focus timer (25 minutes by default)
      setFocusTimer(25 * 60);
    } else {
      setFocusTimer(null);
    }
  };

  // Focus timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusTimer !== null && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const addCategory = () => {
    if (newCategory.name?.trim()) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        color: newCategory.color || 'text-blue-500',
        description: newCategory.description,
        createdAt: new Date(),
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', color: 'text-blue-500' });
      setShowCategoryDialog(false);
    }
  };

  const renderCategoryDialog = () => (
    <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            Create a new category to organize your tasks
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={editingCategory?.name || newCategory.name}
              onChange={(e) => editingCategory 
                ? setEditingCategory({ ...editingCategory, name: e.target.value })
                : setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Category name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                'text-blue-500',
                'text-green-500',
                'text-yellow-500',
                'text-red-500',
                'text-purple-500',
                'text-pink-500',
                'text-indigo-500',
                'text-orange-500',
                'text-teal-500',
                'text-cyan-500',
              ].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${color} border-2 ${
                    (editingCategory?.color || newCategory.color) === color
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                  onClick={() => editingCategory
                    ? setEditingCategory({ ...editingCategory, color })
                    : setNewCategory({ ...newCategory, color })
                  }
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={editingCategory?.description || newCategory.description}
              onChange={(e) => editingCategory
                ? setEditingCategory({ ...editingCategory, description: e.target.value })
                : setNewCategory({ ...newCategory, description: e.target.value })
              }
              placeholder="Category description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setShowCategoryDialog(false);
            setEditingCategory(null);
            setNewCategory({ name: '', color: 'text-blue-500' });
          }}>
            Cancel
          </Button>
          <Button onClick={editingCategory ? () => updateCategoryDetails(editingCategory) : addCategory}>
            {editingCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Add new functions for study planning
  const addStudySession = () => {
    if (newStudySession.title && newStudySession.subject) {
      const session: StudySession = {
        id: Date.now().toString(),
        title: newStudySession.title,
        subject: newStudySession.subject,
        startTime: newStudySession.startTime || new Date(),
        endTime: newStudySession.endTime || new Date(),
        notes: newStudySession.notes,
        recurring: newStudySession.recurring,
        category: newStudySession.category || 'default',
        color: newStudySession.color || '#3b82f6',
        isPrivate: newStudySession.isPrivate || false,
        participants: newStudySession.participants,
        resources: newStudySession.resources,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setStudySessions([...studySessions, session]);
      setNewStudySession({
        title: '',
        subject: '',
        startTime: new Date(),
        endTime: new Date(),
        category: '',
        color: '',
        isPrivate: false,
      });
      setShowStudyForm(false);
    }
  };

  const bookMentorSession = (mentorId: string, sessionId: string) => {
    setStudySessions(sessions =>
      sessions.map(session =>
        session.id === sessionId
          ? { ...session, mentorId }
          : session
      )
    );
    setShowMentorBooking(false);
  };

  const createSharedPlan = () => {
    if (newSharedPlan.title) {
      const plan: SharedPlan = {
        id: Date.now().toString(),
        title: newSharedPlan.title,
        owner: 'current-user', // Replace with actual user ID
        participants: newSharedPlan.participants || [],
        sessions: [],
        isPublic: newSharedPlan.isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSharedPlans([...sharedPlans, plan]);
      setNewSharedPlan({
        title: '',
        isPublic: false,
        participants: []
      });
      setShowSharedPlanForm(false);
    }
  };

  const addSessionToSharedPlan = (planId: string, session: StudySession) => {
    setSharedPlans(plans =>
      plans.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              sessions: [...plan.sessions, { ...session, sharedPlanId: planId }]
            }
          : plan
      )
    );
  };

  const handleMentorBooking = (session: StudySession) => {
    setSelectedSession(session);
    setShowMentorBooking(true);
  };

  const updateStudyProgress = (sessionId: string, progress: Partial<StudyProgress>) => {
    setStudyProgress(prev => {
      const existing = prev.find(p => p.sessionId === sessionId);
      if (existing) {
        return prev.map(p => p.sessionId === sessionId ? { ...p, ...progress } : p);
      }
      return [...prev, { sessionId, completed: false, timeSpent: 0, ...progress }];
    });
  };

  const createTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: Date.now().toString(),
    };
    setTimeBlocks([...timeBlocks, newBlock]);
  };

  const getTimeBlockStats = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    return {
      daily: {
        focus: timeBlocks.filter(b => 
          isSameDay(b.startTime, today) && b.type === 'focus'
        ).reduce((acc, b) => acc + b.duration, 0),
        review: timeBlocks.filter(b => 
          isSameDay(b.startTime, today) && b.type === 'review'
        ).reduce((acc, b) => acc + b.duration, 0),
        break: timeBlocks.filter(b => 
          isSameDay(b.startTime, today) && b.type === 'break'
        ).reduce((acc, b) => acc + b.duration, 0),
      },
      weekly: {
        focus: timeBlocks.filter(b => 
          b.startTime >= weekStart && b.startTime <= weekEnd && b.type === 'focus'
        ).reduce((acc, b) => acc + b.duration, 0),
        review: timeBlocks.filter(b => 
          b.startTime >= weekStart && b.startTime <= weekEnd && b.type === 'review'
        ).reduce((acc, b) => acc + b.duration, 0),
        break: timeBlocks.filter(b => 
          b.startTime >= weekStart && b.startTime <= weekEnd && b.type === 'break'
        ).reduce((acc, b) => acc + b.duration, 0),
      }
    };
  };

  // Add calendar view component
  const renderCalendarView = () => {
    const days = calendarView === 'day' 
      ? [selectedDate]
      : calendarView === 'week'
        ? eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) })
        : eachDayOfInterval({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCalendarView('day')}
              className={calendarView === 'day' ? 'bg-primary text-primary-foreground' : ''}
            >
              Day
            </Button>
            <Button
              variant="outline"
              onClick={() => setCalendarView('week')}
              className={calendarView === 'week' ? 'bg-primary text-primary-foreground' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setCalendarView('month')}
              className={calendarView === 'month' ? 'bg-primary text-primary-foreground' : ''}
            >
              Month
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map(day => (
            <Card key={day.toISOString()}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {format(day, 'EEE, MMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeBlocks
                    .filter(block => isSameDay(block.startTime, day))
                    .map(block => (
                      <div
                        key={block.id}
                        className={cn(
                          "p-2 rounded text-sm",
                          block.type === 'focus' && "bg-blue-100 dark:bg-blue-900",
                          block.type === 'review' && "bg-green-100 dark:bg-green-900",
                          block.type === 'break' && "bg-yellow-100 dark:bg-yellow-900",
                          block.type === 'group' && "bg-purple-100 dark:bg-purple-900"
                        )}
                      >
                        <div className="font-medium">{block.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}
                        </div>
                        {block.description && (
                          <div className="text-xs mt-1">{block.description}</div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Update the renderStudyView function to remove resources tab
  const renderStudyView = () => {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="sessions">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center">
                          <span className={`mr-2 ${subject.color}`}>●</span>
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowStudyForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Study Session
                </Button>
                <Button variant="outline" onClick={() => setShowSharedPlanForm(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Create Shared Plan
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studySessions
                .filter(session => selectedSubject === 'all' || session.subject === selectedSubject)
                .map(session => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(session.startTime, 'MMM dd, h:mm a')} - {format(session.endTime, 'h:mm a')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={session.color}>
                            {subjects.find(s => s.id === session.subject)?.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStudySession(session.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mb-2">{session.notes}</p>
                      )}
                      {session.recurring && (
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Repeat className="w-4 h-4 mr-1" />
                          {session.recurring.type} ({session.recurring.interval})
                        </div>
                      )}
                      {session.timeBlock && (
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Timer className="w-4 h-4 mr-1" />
                          {session.timeBlock.type} ({session.timeBlock.duration} min)
                        </div>
                      )}
                      {session.timeBlocks && session.timeBlocks.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {session.timeBlocks.map((block, index) => (
                            <div key={block.id} className="flex items-center text-sm">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                block.type === 'focus' ? 'bg-blue-500' :
                                block.type === 'review' ? 'bg-green-500' :
                                block.type === 'break' ? 'bg-yellow-500' :
                                'bg-purple-500'
                              }`} />
                              {block.type} ({block.duration} min)
                              {block.description && (
                                <span className="text-muted-foreground ml-2">- {block.description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {session.resources && session.resources.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Resources:</h4>
                          <div className="space-y-1">
                            {session.resources.map((resource, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm text-blue-500 hover:underline"
                                >
                                  {resource.title}
                                </a>
                                {resource.tags && (
                                  <div className="flex gap-1">
                                    {resource.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!session.mentorId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleMentorBooking(session)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Book Mentor
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            {renderCalendarView()}
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Focus Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTimeBlockStats().daily.focus} min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimeBlockStats().daily.review} min review time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTimeBlockStats().weekly.focus} min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimeBlockStats().weekly.review} min review time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Study Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {timeBlocks.filter(b => 
                        isSameDay(b.startTime, new Date()) && b.type === 'focus'
                      ).length > 0 ? '🔥' : '❄️'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Keep up the good work!
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pomodoro">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold">
                      {Math.floor(pomodoroTimeLeft / 60)}:{(pomodoroTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {pomodoroPhase === 'focus' ? 'Focus Time' : 
                       pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </div>
                    <div className="flex justify-center gap-4">
                      {!isPomodoroActive ? (
                        <Button onClick={startPomodoro} size="lg">
                          Start
                        </Button>
                      ) : (
                        <Button onClick={pausePomodoro} size="lg" variant="outline">
                          Pause
                        </Button>
                      )}
                      <Button onClick={resetPomodoro} size="lg" variant="outline">
                        Reset
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Pomodoros: {pomodoroCount}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pomodoro Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Focus Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={pomodoroSettings.focusDuration}
                          onChange={(e) => setPomodoroSettings({
                            ...pomodoroSettings,
                            focusDuration: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Short Break Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={pomodoroSettings.shortBreakDuration}
                          onChange={(e) => setPomodoroSettings({
                            ...pomodoroSettings,
                            shortBreakDuration: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Long Break Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={pomodoroSettings.longBreakDuration}
                          onChange={(e) => setPomodoroSettings({
                            ...pomodoroSettings,
                            longBreakDuration: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Long Break Interval</Label>
                        <Input
                          type="number"
                          value={pomodoroSettings.longBreakInterval}
                          onChange={(e) => setPomodoroSettings({
                            ...pomodoroSettings,
                            longBreakInterval: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoStartBreaks"
                        checked={pomodoroSettings.autoStartBreaks}
                        onCheckedChange={(checked) => setPomodoroSettings({
                          ...pomodoroSettings,
                          autoStartBreaks: checked as boolean
                        })}
                      />
                      <Label htmlFor="autoStartBreaks">Auto-start breaks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoStartPomodoros"
                        checked={pomodoroSettings.autoStartPomodoros}
                        onCheckedChange={(checked) => setPomodoroSettings({
                          ...pomodoroSettings,
                          autoStartPomodoros: checked as boolean
                        })}
                      />
                      <Label htmlFor="autoStartPomodoros">Auto-start pomodoros</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            {renderTemplatesTab()}
          </TabsContent>
        </Tabs>

        {/* Template Form Dialog */}
        <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Study Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for your study sessions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="Template title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={newTemplate.subject}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Template description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate({ ...newTemplate, duration: parseInt(e.target.value) })}
                    min="15"
                    step="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={newTemplate.difficulty}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setNewTemplate({ ...newTemplate, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time Blocks</Label>
                <div className="space-y-2">
                  {(newTemplate.timeBlocks || []).map((block, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select
                        value={block.type}
                        onValueChange={(value: 'focus' | 'review' | 'break' | 'group') => {
                          const blocks = [...(newTemplate.timeBlocks || [])];
                          blocks[index] = { ...blocks[index], type: value };
                          setNewTemplate({ ...newTemplate, timeBlocks: blocks });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="focus">Focus</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="break">Break</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={block.duration}
                        onChange={(e) => {
                          const blocks = [...(newTemplate.timeBlocks || [])];
                          blocks[index] = { ...blocks[index], duration: parseInt(e.target.value) };
                          setNewTemplate({ ...newTemplate, timeBlocks: blocks });
                        }}
                        placeholder="Duration"
                        className="w-[100px]"
                      />
                      <Input
                        value={block.description}
                        onChange={(e) => {
                          const blocks = [...(newTemplate.timeBlocks || [])];
                          blocks[index] = { ...blocks[index], description: e.target.value };
                          setNewTemplate({ ...newTemplate, timeBlocks: blocks });
                        }}
                        placeholder="Description"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const blocks = [...(newTemplate.timeBlocks || [])];
                          blocks.splice(index, 1);
                          setNewTemplate({ ...newTemplate, timeBlocks: blocks });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blocks = [...(newTemplate.timeBlocks || [])];
                      blocks.push({
                        type: 'focus',
                        duration: 25,
                        description: '',
                        order: blocks.length
                      });
                      setNewTemplate({ ...newTemplate, timeBlocks: blocks });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Block
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prerequisites</Label>
                <div className="flex flex-wrap gap-2">
                  {(newTemplate.prerequisites || []).map((prereq, index) => (
                    <Badge key={index} variant="secondary">
                      {prereq}
                      <button
                        className="ml-1"
                        onClick={() => {
                          const prereqs = [...(newTemplate.prerequisites || [])];
                          prereqs.splice(index, 1);
                          setNewTemplate({ ...newTemplate, prerequisites: prereqs });
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add prerequisite"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        const prereqs = [...(newTemplate.prerequisites || []), e.currentTarget.value];
                        setNewTemplate({ ...newTemplate, prerequisites: prereqs });
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-[200px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {(newTemplate.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                      <button
                        className="ml-1"
                        onClick={() => {
                          const tags = [...(newTemplate.tags || [])];
                          tags.splice(index, 1);
                          setNewTemplate({ ...newTemplate, tags });
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        const tags = [...(newTemplate.tags || []), e.currentTarget.value];
                        setNewTemplate({ ...newTemplate, tags });
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-[200px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowTemplateForm(false);
                setNewTemplate({
                  title: '',
                  duration: 60,
                  subject: '',
                  timeBlocks: []
                });
              }}>
                Cancel
              </Button>
              <Button onClick={createStudyTemplate}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Add new functions for enhanced features
  const startPomodoro = () => {
    setIsPomodoroActive(true);
    setPomodoroTimeLeft(pomodoroSettings.focusDuration * 60);
    setPomodoroPhase('focus');
  };

  const pausePomodoro = () => {
    setIsPomodoroActive(false);
  };

  const resetPomodoro = () => {
    setIsPomodoroActive(false);
    setPomodoroTimeLeft(pomodoroSettings.focusDuration * 60);
    setPomodoroPhase('focus');
    setPomodoroCount(0);
  };

  const addStudyResource = () => {
    if (newResource.title && newResource.url) {
      const resource: StudyResource = {
        id: Date.now().toString(),
        title: newResource.title,
        type: newResource.type || 'note',
        url: newResource.url,
        description: newResource.description,
        tags: newResource.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setStudyResources([...studyResources, resource]);
      setNewResource({
        title: '',
        type: 'note',
        url: '',
      });
      setShowResourceForm(false);
      addNotification({
        title: 'Resource Added',
        message: `New study resource "${resource.title}" has been added.`,
        type: 'resource'
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const createStudyTemplate = () => {
    if (newTemplate.title && newTemplate.subject) {
      const template: StudyTemplate = {
        id: Date.now().toString(),
        title: newTemplate.title,
        description: newTemplate.description,
        duration: newTemplate.duration || 60,
        subject: newTemplate.subject,
        timeBlocks: newTemplate.timeBlocks || [],
        resources: newTemplate.resources,
        tags: newTemplate.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setStudyTemplates([...studyTemplates, template]);
      setNewTemplate({
        title: '',
        duration: 60,
        subject: '',
        timeBlocks: []
      });
      setShowTemplateForm(false);
    }
  };

  const applyTemplate = (template: StudyTemplate) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Apply template "${template.title}"?\n\n` +
      `Duration: ${template.duration} minutes\n` +
      `Subject: ${subjects.find(s => s.id === template.subject)?.name}\n\n` +
      `This will create a new study session starting now.`
    );

    if (!confirmed) return;

    const startTime = new Date();
    const session: StudySession = {
      id: Date.now().toString(),
      title: template.title,
      subject: template.subject,
      startTime,
      endTime: addMinutes(startTime, template.duration),
      category: template.subject,
      color: subjects.find(s => s.id === template.subject)?.color || '#3b82f6',
      isPrivate: false,
      timeBlock: {
        type: 'focus',
        duration: template.duration
      },
      notes: template.description,
      resources: template.resources?.map(resourceId => ({
        type: 'note',
        url: '',
        title: resourceId
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add all time blocks from the template
    if (template.timeBlocks && template.timeBlocks.length > 0) {
      let currentTime = startTime;
      session.timeBlocks = template.timeBlocks.map(block => {
        const blockStartTime = new Date(currentTime);
        currentTime = addMinutes(currentTime, block.duration);
        return {
          id: Date.now().toString() + Math.random(),
          type: block.type,
          duration: block.duration,
          startTime: blockStartTime,
          endTime: new Date(currentTime),
          subject: template.subject,
          description: block.description,
          completed: false
        };
      });
    }

    setStudySessions([...studySessions, session]);

    // Add success notification
    addNotification({
      title: 'Template Applied',
      message: `Study session "${template.title}" has been created successfully.`,
      type: 'session'
    });
  };

  // Add new functions for resource management
  const addResourceTag = () => {
    if (newResourceTag.name) {
      const tag: ResourceTag = {
        id: Date.now().toString(),
        name: newResourceTag.name,
        color: newResourceTag.color || '#3b82f6'
      };
      setResourceTags([...resourceTags, tag]);
      setNewResourceTag({ name: '', color: '#3b82f6' });
      setShowResourceTagForm(false);
    }
  };

  const deleteResource = (id: string) => {
    setStudyResources(studyResources.filter(r => r.id !== id));
    addNotification({
      title: 'Resource Deleted',
      message: 'A study resource has been removed from your library.',
      type: 'resource'
    });
  };

  const updateResource = (id: string, updates: Partial<StudyResource>) => {
    setStudyResources(studyResources.map(resource =>
      resource.id === id ? { ...resource, ...updates, updatedAt: new Date() } : resource
    ));
    addNotification({
      title: 'Resource Updated',
      message: 'Study resource has been updated successfully.',
      type: 'resource'
    });
  };

  // Add new function for creating pre-defined templates
  const createPredefinedTemplate = (type: TemplateCategory) => {
    const now = new Date();
    let template: Partial<StudyTemplate> = {
      title: '',
      duration: 60,
      subject: '',
      timeBlocks: [],
      difficulty: 'intermediate',
      tags: [],
      prerequisites: []
    };

    switch (type) {
      case 'focus':
        template = {
          ...template,
          title: 'Deep Focus Session',
          duration: 120,
          timeBlocks: [
            { type: 'focus', duration: 25, description: 'Initial focus block', order: 0 },
            { type: 'break', duration: 5, description: 'Short break', order: 1 },
            { type: 'focus', duration: 25, description: 'Second focus block', order: 2 },
            { type: 'break', duration: 5, description: 'Short break', order: 3 },
            { type: 'focus', duration: 25, description: 'Third focus block', order: 4 },
            { type: 'break', duration: 15, description: 'Long break', order: 5 },
            { type: 'focus', duration: 25, description: 'Final focus block', order: 6 }
          ],
          tags: ['focus', 'pomodoro', 'productivity'],
          prerequisites: ['Quiet environment', 'Water bottle', 'Study materials']
        };
        break;

      case 'review':
        template = {
          ...template,
          title: 'Comprehensive Review Session',
          duration: 90,
          timeBlocks: [
            { type: 'review', duration: 20, description: 'Quick overview', order: 0 },
            { type: 'focus', duration: 30, description: 'Detailed review', order: 1 },
            { type: 'break', duration: 10, description: 'Break', order: 2 },
            { type: 'review', duration: 30, description: 'Practice questions', order: 3 }
          ],
          tags: ['review', 'practice', 'comprehensive'],
          prerequisites: ['Notes', 'Practice materials', 'Summary sheets']
        };
        break;

      case 'exam':
        template = {
          ...template,
          title: 'Exam Preparation Session',
          duration: 180,
          timeBlocks: [
            { type: 'focus', duration: 45, description: 'Topic review', order: 0 },
            { type: 'break', duration: 15, description: 'Break', order: 1 },
            { type: 'review', duration: 60, description: 'Practice exam', order: 2 },
            { type: 'break', duration: 15, description: 'Break', order: 3 },
            { type: 'review', duration: 45, description: 'Review answers', order: 4 }
          ],
          tags: ['exam', 'preparation', 'practice'],
          prerequisites: ['Past papers', 'Formula sheets', 'Study guide']
        };
        break;

      case 'group':
        template = {
          ...template,
          title: 'Group Study Session',
          duration: 120,
          timeBlocks: [
            { type: 'group', duration: 30, description: 'Discussion', order: 0 },
            { type: 'focus', duration: 45, description: 'Individual work', order: 1 },
            { type: 'break', duration: 15, description: 'Break', order: 2 },
            { type: 'group', duration: 30, description: 'Group review', order: 3 }
          ],
          tags: ['group', 'collaborative', 'discussion'],
          prerequisites: ['Study materials', 'Group members', 'Meeting space']
        };
        break;

      case 'language':
        template = {
          ...template,
          title: 'Language Learning Session',
          duration: 90,
          timeBlocks: [
            { type: 'focus', duration: 20, description: 'Vocabulary practice', order: 0 },
            { type: 'review', duration: 15, description: 'Grammar review', order: 1 },
            { type: 'break', duration: 10, description: 'Break', order: 2 },
            { type: 'focus', duration: 25, description: 'Speaking practice', order: 3 },
            { type: 'review', duration: 20, description: 'Writing exercise', order: 4 }
          ],
          tags: ['language', 'vocabulary', 'grammar', 'speaking'],
          prerequisites: ['Language textbook', 'Flashcards', 'Audio materials']
        };
        break;

      case 'project':
        template = {
          ...template,
          title: 'Project Work Session',
          duration: 150,
          timeBlocks: [
            { type: 'focus', duration: 30, description: 'Planning and setup', order: 0 },
            { type: 'focus', duration: 45, description: 'Main work', order: 1 },
            { type: 'break', duration: 15, description: 'Break', order: 2 },
            { type: 'review', duration: 30, description: 'Review and testing', order: 3 },
            { type: 'focus', duration: 30, description: 'Documentation', order: 4 }
          ],
          tags: ['project', 'development', 'planning'],
          prerequisites: ['Project requirements', 'Development environment', 'Documentation tools']
        };
        break;

      case 'research':
        template = {
          ...template,
          title: 'Research Session',
          duration: 180,
          timeBlocks: [
            { type: 'focus', duration: 30, description: 'Literature review', order: 0 },
            { type: 'break', duration: 15, description: 'Break', order: 1 },
            { type: 'focus', duration: 45, description: 'Data analysis', order: 2 },
            { type: 'break', duration: 15, description: 'Break', order: 3 },
            { type: 'review', duration: 45, description: 'Findings review', order: 4 },
            { type: 'focus', duration: 30, description: 'Writing notes', order: 5 }
          ],
          tags: ['research', 'analysis', 'writing'],
          prerequisites: ['Research materials', 'Data sets', 'Analysis tools']
        };
        break;
    }

    setNewTemplate(template);
    setShowTemplateForm(true);
  };

  // Update the templates tab content with filtering
  const renderTemplatesTab = () => {
    const filteredTemplates = studyTemplates.filter(template => {
      const matchesCategory = selectedTemplateCategory === 'all' || 
        template.tags?.includes(selectedTemplateCategory);
      const matchesSearch = template.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(templateSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Study Templates</h3>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('focus')}>
                  Deep Focus Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('review')}>
                  Comprehensive Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('exam')}>
                  Exam Preparation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('group')}>
                  Group Study
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('language')}>
                  Language Learning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('project')}>
                  Project Work
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createPredefinedTemplate('research')}>
                  Research Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Custom Template
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Select
            value={selectedTemplateCategory}
            onValueChange={(value: TemplateCategory | 'all') => setSelectedTemplateCategory(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="focus">Focus Sessions</SelectItem>
              <SelectItem value="review">Review Sessions</SelectItem>
              <SelectItem value="exam">Exam Preparation</SelectItem>
              <SelectItem value="group">Group Study</SelectItem>
              <SelectItem value="language">Language Learning</SelectItem>
              <SelectItem value="project">Project Work</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {subjects.find(s => s.id === template.subject)?.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{template.duration} min</Badge>
                    {template.difficulty && (
                      <Badge variant="secondary">{template.difficulty}</Badge>
                    )}
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  {template.timeBlocks
                    .sort((a, b) => a.order - b.order)
                    .map((block, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          block.type === 'focus' ? 'bg-blue-500' :
                          block.type === 'review' ? 'bg-green-500' :
                          block.type === 'break' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        {block.type} ({block.duration} min)
                        {block.description && (
                          <span className="text-muted-foreground ml-2">- {block.description}</span>
                        )}
                      </div>
                    ))}
                </div>
                {template.prerequisites && template.prerequisites.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-sm font-medium mb-1">Prerequisites:</h5>
                    <div className="flex flex-wrap gap-1">
                      {template.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {template.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => applyTemplate(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Add deleteStudySession function
  const deleteStudySession = (sessionId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this study session?');
    if (!confirmed) return;

    setStudySessions(studySessions.filter(session => session.id !== sessionId));
    addNotification({
      title: 'Session Deleted',
      message: 'Study session has been deleted successfully.',
      type: 'session'
    });
  };

  // Add new functions for class management
  const createClass = () => {
    if (newClass.name && newClass.subject) {
      const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newClassData: Class = {
        id: Date.now().toString(),
        name: newClass.name,
        description: newClass.description,
        subject: newClass.subject,
        code: classCode,
        teachers: [],
        students: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        schedule: newClass.schedule,
        settings: newClass.settings
      };
      setClasses([...classes, newClassData]);
      setNewClass({
        name: '',
        subject: '',
        settings: {
          allowStudentInvites: true,
          requireApproval: true,
          allowFileSharing: true
        }
      });
      setShowClassForm(false);
      addNotification({
        title: 'Class Created',
        message: `New class "${newClassData.name}" has been created with code: ${classCode}`,
        type: 'session'
      });
    }
  };

  const inviteToClass = (classId: string) => {
    if (inviteEmail) {
      const targetClass = classes.find(c => c.id === classId);
      if (targetClass) {
        // In a real app, this would send an email invitation
        addNotification({
          title: 'Invitation Sent',
          message: `Invitation sent to ${inviteEmail} to join ${targetClass.name}`,
          type: 'session'
        });
        setInviteEmail('');
      }
    }
  };

  const createAssignment = () => {
    if (newAssignment.title && selectedClass) {
      const assignment: Assignment = {
        id: Date.now().toString(),
        classId: selectedClass.id,
        title: newAssignment.title,
        description: newAssignment.description,
        type: newAssignment.type || 'assignment',
        dueDate: newAssignment.dueDate,
        points: newAssignment.points,
        status: 'draft',
        questions: newAssignment.questions || [],
        submissions: [],
        attachments: newAssignment.attachments,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setAssignments([...assignments, assignment]);
      setNewAssignment({
        title: '',
        type: 'assignment',
        status: 'draft'
      });
      setShowAssignmentForm(false);
      addNotification({
        title: 'Assignment Created',
        message: `New ${assignment.type} "${assignment.title}" has been created`,
        type: 'session'
      });
    }
  };

  const addQuestion = (assignmentId: string, question: Omit<Question, 'id'>) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const newQuestion: Question = {
          ...question,
          id: Date.now().toString()
        };
        return {
          ...assignment,
          questions: [...(assignment.questions || []), newQuestion]
        };
      }
      return assignment;
    }));
  };

  const publishAssignment = (assignmentId: string) => {
    setAssignments(assignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, status: 'published' }
        : assignment
    ));
    addNotification({
      title: 'Assignment Published',
      message: 'Assignment has been published to students',
      type: 'session'
    });
  };

  const gradeSubmission = (assignmentId: string, submissionId: string, grade: number, feedback?: string) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          submissions: assignment.submissions?.map(submission =>
            submission.id === submissionId
              ? { ...submission, grade, feedback, gradedAt: new Date() }
              : submission
          )
        };
      }
      return assignment;
    }));
  };

  // Add new function to render class management view
  const renderClassManagementView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Class Management</h2>
          <Button onClick={() => setShowClassForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </div>

        <Tabs defaultValue="classes">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(classItem => (
                <Card key={classItem.id}>
                  <CardHeader>
                    <CardTitle>{classItem.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {classItem.subject} • Code: {classItem.code}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Teachers</h4>
                        <div className="space-y-1">
                          {classItem.teachers.map(teacherId => (
                            <div key={teacherId} className="text-sm">
                              {teacherId}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Students</h4>
                        <div className="space-y-1">
                          {classItem.students.map(studentId => (
                            <div key={studentId} className="text-sm">
                              {studentId}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowAssignmentForm(true);
                          }}
                        >
                          Add Assignment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setInviteEmail('');
                          }}
                        >
                          Invite
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Assignments</h3>
                <Button onClick={() => setShowAssignmentForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map(assignment => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {assignment.type} • Due: {assignment.dueDate ? format(assignment.dueDate, 'MMM dd, yyyy') : 'No due date'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assignment.description && (
                          <p className="text-sm">{assignment.description}</p>
                        )}
                        {assignment.attachments && assignment.attachments.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Attachments</h4>
                            <div className="space-y-2">
                              {assignment.attachments.map(attachmentId => {
                                const attachment = attachments.find(a => a.id === attachmentId);
                                return attachment ? (
                                  <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                    <span className={`w-2 h-2 rounded-full ${
                                      attachment.type === 'drive' ? 'bg-blue-500' :
                                      attachment.type === 'youtube' ? 'bg-red-500' :
                                      attachment.type === 'link' ? 'bg-green-500' :
                                      'bg-gray-500'
                                    }`} />
                                    {attachment.title}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowGradeDialog(true);
                            }}
                          >
                            Grade
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAttachmentDialog(true);
                            }}
                          >
                            Add Attachment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gradebook">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gradebook</h3>
                <Button onClick={() => setShowRubricDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rubric
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Student</th>
                      {assignments.map(assignment => (
                        <th key={assignment.id} className="text-center p-2">
                          {assignment.title}
                        </th>
                      ))}
                      <th className="text-center p-2">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradebook.map(entry => (
                      <tr key={entry.studentId}>
                        <td className="p-2">{entry.studentId}</td>
                        {assignments.map(assignment => {
                          const assignmentGrade = entry.assignments.find(a => a.assignmentId === assignment.id);
                          return (
                            <td key={assignment.id} className="text-center p-2">
                              {assignmentGrade ? (
                                <div className="flex flex-col items-center">
                                  <span>{assignmentGrade.grade}/{assignmentGrade.maxPoints}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {((assignmentGrade.grade / assignmentGrade.maxPoints) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center p-2 font-medium">
                          {entry.average.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="communication">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Select value={messageFilter} onValueChange={(value: typeof messageFilter) => setMessageFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter messages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Messages</SelectItem>
                      <SelectItem value="announcement">Announcements</SelectItem>
                      <SelectItem value="discussion">Discussions</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowMessageDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                  <Button onClick={() => setShowCreateRoomDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Chat Rooms Sidebar */}
                <div className="col-span-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Chat Rooms</h3>
                    {chatRooms.map(room => (
                      <Card 
                        key={room.id}
                        className={`cursor-pointer ${selectedRoom?.id === room.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{room.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {room.participants.length} members
                              </p>
                            </div>
                            {room.type === 'private' && (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedRoom && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Topics</h3>
                      {selectedRoom.topics?.map(topic => (
                        <Button
                          key={topic.id}
                          variant={selectedTopic === topic.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          {topic.name}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Show create topic dialog
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Topic
                      </Button>
                    </div>
                  )}
                </div>

                {/* Chat Room Content */}
                <div className="col-span-3 space-y-4">
                  {selectedRoom ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedRoom.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedRoom.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowParticipantsDialog(true)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Participants
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInviteDialog(true)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRoomSettingsDialog(true)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                          {selectedRoom.settings.allowVideoCalls && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (isInCall) {
                                  endVideoCall();
                                } else {
                                  setShowVideoCallDialog(true);
                                }
                              }}
                            >
                              {isInCall ? (
                                <PhoneOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Phone className="w-4 h-4 mr-2" />
                              )}
                              {isInCall ? 'End Call' : 'Start Call'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Search messages..."
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTopicDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Topic
                        </Button>
                      </div>

                      {selectedRoom.pinnedMessages && selectedRoom.pinnedMessages.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Pinned Messages</h4>
                          {selectedRoom.pinnedMessages.map(messageId => {
                            const message = roomMessages.find(m => m.id === messageId);
                            return message ? (
                              <Card key={message.id}>
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm">{message.content}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Pinned by {message.senderId}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        // Unpin message
                                      }}
                                    >
                                      <PinOff className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div className="space-y-4">
                        {roomMessages
                          .filter(message => !selectedTopic || message.topicId === selectedTopic)
                          .map(message => (
                            <Card key={message.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold">{message.senderId}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(message.createdAt, 'MMM dd, h:mm a')}
                                      {message.isEdited && ' (edited)'}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {message.reactions?.map(reaction => (
                                      <Badge key={reaction.userId} variant="secondary">
                                        {reaction.type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <p className="mb-4">{message.content}</p>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mb-4">
                                    <h5 className="font-medium mb-2">Attachments</h5>
                                    <div className="space-y-2">
                                      {message.attachments.map(attachmentId => {
                                        const attachment = attachments.find(a => a.id === attachmentId);
                                        return attachment ? (
                                          <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                            <span className={`w-2 h-2 rounded-full ${
                                              attachment.type === 'drive' ? 'bg-blue-500' :
                                              attachment.type === 'youtube' ? 'bg-red-500' :
                                              attachment.type === 'link' ? 'bg-green-500' :
                                              'bg-gray-500'
                                            }`} />
                                            {attachment.title}
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                )}
                                {message.replies && message.replies.length > 0 && (
                                  <div className="space-y-2 pl-4 border-l-2">
                                    {message.replies.map(reply => (
                                      <div key={reply.id} className="text-sm">
                                        <span className="font-medium">{reply.senderId}</span>
                                        <span className="text-muted-foreground ml-2">
                                          {format(reply.createdAt, 'MMM dd, h:mm a')}
                                        </span>
                                        <p className="mt-1">{reply.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMessage(message);
                                      setShowMessageDialog(true);
                                    }}
                                  >
                                    Reply
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMessageReaction(message.id, 'current-user', '👍')}
                                  >
                                    React
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => pinMessage(message.id)}
                                  >
                                    <Pin className="w-4 h-4" />
                                  </Button>
                                  {message.senderId === 'current-user' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Show edit message dialog
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage.content || ''}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                        />
                        {selectedRoom.settings.allowFileSharing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFileUploadDialog(true)}
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                        )}
                        {selectedRoom.settings.allowVoiceMessages && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (isRecording) {
                                stopVoiceRecording();
                              } else {
                                setShowVoiceMessageDialog(true);
                              }
                            }}
                          >
                            {isRecording ? (
                              <Square className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (newMessage.content) {
                              sendMessage({
                                ...newMessage as Message,
                                classId: selectedClass?.id || '',
                                senderId: 'current-user',
                                createdAt: new Date(),
                                updatedAt: new Date()
                              });
                              setNewMessage({ type: 'discussion', content: '', attachments: [] });
                            }
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Select a chat room to start messaging</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chat Room Dialogs */}
          <Dialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Chat Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Enter room name"
                    value={newRoom?.name || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter room description"
                    value={newRoom?.description || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newRoom?.type || 'group'}
                    onValueChange={(value: ChatRoom['type']) => setNewRoom({ ...newRoom, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private"
                        checked={newRoom?.settings?.isPrivate}
                        onCheckedChange={(checked) => 
                          setNewRoom({
                            ...newRoom,
                            settings: { ...newRoom?.settings, isPrivate: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="private">Private Room</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="invites"
                        checked={newRoom?.settings?.allowInvites}
                        onCheckedChange={(checked) => 
                          setNewRoom({
                            ...newRoom,
                            settings: { ...newRoom?.settings, allowInvites: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="invites">Allow Invites</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approval"
                        checked={newRoom?.settings?.requireApproval}
                        onCheckedChange={(checked) => 
                          setNewRoom({
                            ...newRoom,
                            settings: { ...newRoom?.settings, requireApproval: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="approval">Require Approval</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateRoomDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newRoom?.name) {
                      createChatRoom(newRoom);
                      setShowCreateRoomDialog(false);
                      setNewRoom(null);
                    }
                  }}
                >
                  Create Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>User</Label>
                  <Input
                    placeholder="Enter user email or ID"
                    value={inviteUser}
                    onChange={(e) => setInviteUser(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRoom && inviteUser) {
                      inviteToRoom(selectedRoom.id, inviteUser);
                      setShowInviteDialog(false);
                      setInviteUser('');
                    }
                  }}
                >
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showRoomSettingsDialog} onOpenChange={setShowRoomSettingsDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Room Settings</DialogTitle>
              </DialogHeader>
              {selectedRoom && (
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={selectedRoom.name}
                      onChange={(e) => {
                        const updatedRoom = {
                          ...selectedRoom,
                          name: e.target.value
                        };
                        setChatRooms(chatRooms.map(r => 
                          r.id === selectedRoom.id ? updatedRoom : r
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={selectedRoom.description || ''}
                      onChange={(e) => {
                        const updatedRoom = {
                          ...selectedRoom,
                          description: e.target.value
                        };
                        setChatRooms(chatRooms.map(r => 
                          r.id === selectedRoom.id ? updatedRoom : r
                        ));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Settings</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="private-settings"
                          checked={selectedRoom.settings.isPrivate}
                          onCheckedChange={(checked) => {
                            const updatedRoom = {
                              ...selectedRoom,
                              settings: {
                                ...selectedRoom.settings,
                                isPrivate: checked as boolean
                              }
                            };
                            setChatRooms(chatRooms.map(r => 
                              r.id === selectedRoom.id ? updatedRoom : r
                            ));
                          }}
                        />
                        <Label htmlFor="private-settings">Private Room</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="invites-settings"
                          checked={selectedRoom.settings.allowInvites}
                          onCheckedChange={(checked) => {
                            const updatedRoom = {
                              ...selectedRoom,
                              settings: {
                                ...selectedRoom.settings,
                                allowInvites: checked as boolean
                              }
                            };
                            setChatRooms(chatRooms.map(r => 
                              r.id === selectedRoom.id ? updatedRoom : r
                            ));
                          }}
                        />
                        <Label htmlFor="invites-settings">Allow Invites</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="approval-settings"
                          checked={selectedRoom.settings.requireApproval}
                          onCheckedChange={(checked) => {
                            const updatedRoom = {
                              ...selectedRoom,
                              settings: {
                                ...selectedRoom.settings,
                                requireApproval: checked as boolean
                              }
                            };
                            setChatRooms(chatRooms.map(r => 
                              r.id === selectedRoom.id ? updatedRoom : r
                            ));
                          }}
                        />
                        <Label htmlFor="approval-settings">Require Approval</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRoomSettingsDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>

        {/* Existing dialogs */}
        {/* ... */}

        {/* New Attachment Dialog */}
        <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Attachment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={selectedAttachment.type}
                  onValueChange={(value: Attachment['type']) => 
                    setSelectedAttachment({ ...selectedAttachment, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drive">Google Drive</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedAttachment.title}
                  onChange={(e) => setSelectedAttachment({ ...selectedAttachment, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={selectedAttachment.url}
                  onChange={(e) => setSelectedAttachment({ ...selectedAttachment, url: e.target.value })}
                  placeholder="Enter URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={selectedAttachment.description}
                  onChange={(e) => setSelectedAttachment({ ...selectedAttachment, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedAttachment.type && selectedAttachment.title && selectedAttachment.url) {
                  addAttachment({
                    ...selectedAttachment as Attachment,
                    uploadedBy: 'current-user',
                    uploadedAt: new Date()
                  });
                  setShowAttachmentDialog(false);
                  setSelectedAttachment({});
                }
              }}>
                Add Attachment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Rubric Dialog */}
        <Dialog open={showRubricDialog} onOpenChange={setShowRubricDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Rubric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={selectedRubric.name}
                  onChange={(e) => setSelectedRubric({ ...selectedRubric, name: e.target.value })}
                  placeholder="Enter rubric name"
                />
              </div>
              <div className="space-y-2">
                <Label>Criteria</Label>
                <div className="space-y-2">
                  {(selectedRubric.criteria || []).map((criterion, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={criterion.name}
                          onChange={(e) => {
                            const criteria = [...(selectedRubric.criteria || [])];
                            criteria[index] = { ...criteria[index], name: e.target.value };
                            setSelectedRubric({ ...selectedRubric, criteria });
                          }}
                          placeholder="Criterion name"
                        />
                        <Input
                          value={criterion.description}
                          onChange={(e) => {
                            const criteria = [...(selectedRubric.criteria || [])];
                            criteria[index] = { ...criteria[index], description: e.target.value };
                            setSelectedRubric({ ...selectedRubric, criteria });
                          }}
                          placeholder="Description"
                        />
                      </div>
                      <Input
                        type="number"
                        value={criterion.points}
                        onChange={(e) => {
                          const criteria = [...(selectedRubric.criteria || [])];
                          criteria[index] = { ...criteria[index], points: parseInt(e.target.value) };
                          setSelectedRubric({ ...selectedRubric, criteria });
                        }}
                        placeholder="Points"
                        className="w-20"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const criteria = [...(selectedRubric.criteria || [])];
                          criteria.splice(index, 1);
                          setSelectedRubric({ ...selectedRubric, criteria });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const criteria = [...(selectedRubric.criteria || [])];
                      criteria.push({ name: '', description: '', points: 0 });
                      setSelectedRubric({ ...selectedRubric, criteria });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Criterion
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRubricDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedRubric.name && selectedRubric.criteria?.length) {
                  createRubric({
                    ...selectedRubric as Rubric,
                    totalPoints: (selectedRubric.criteria || []).reduce((sum, c) => sum + c.points, 0)
                  });
                  setShowRubricDialog(false);
                  setSelectedRubric({});
                }
              }}>
                Create Rubric
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newMessage.type || 'discussion'}
                  onValueChange={(value: Message['type']) => 
                    setNewMessage(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newMessage.content || ''}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter message content"
                />
              </div>
              <div>
                <Label>Attachments</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map(attachment => (
                    <Badge
                      key={attachment.id}
                      variant={newMessage.attachments?.includes(attachment.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const attachments = newMessage.attachments || [];
                        const index = attachments.indexOf(attachment.id);
                        if (index === -1) {
                          setNewMessage(prev => ({
                            ...prev,
                            attachments: [...attachments, attachment.id]
                          }));
                        } else {
                          attachments.splice(index, 1);
                          setNewMessage(prev => ({
                            ...prev,
                            attachments: [...attachments]
                          }));
                        }
                      }}
                    >
                      {attachment.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (newMessage.type && newMessage.content) {
                  sendMessage({
                    ...newMessage as Message,
                    classId: selectedClass?.id || '',
                    senderId: 'current-user',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                  setShowMessageDialog(false);
                  setNewMessage({ type: 'discussion', content: '', attachments: [] });
                }
              }}>
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Dialogs */}
        <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Enter topic name"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter topic description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTopicDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRoom && newTopic.name) {
                    createTopic(selectedRoom.id, newTopic);
                    setShowTopicDialog(false);
                    setNewTopic({ name: '', description: '' });
                  }
                }}
              >
                Create Topic
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showParticipantsDialog} onOpenChange={setShowParticipantsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room Participants</DialogTitle>
            </DialogHeader>
            {selectedRoom && (
              <div className="space-y-4">
                {selectedRoom.participants.map(participant => (
                  <div key={participant.userId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{participant.userId}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {format(participant.joinedAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={participant.role}
                        onValueChange={(value: 'admin' | 'moderator' | 'member') => 
                          updateRoomParticipant(selectedRoom.id, participant.userId, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoomParticipant(selectedRoom.id, participant.userId)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowParticipantsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </label>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFileUploadDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (selectedFile) {
                    const attachment = await handleFileUpload(selectedFile);
                    if (selectedRoom) {
                      sendRoomMessage({
                        roomId: selectedRoom.id,
                        senderId: 'current-user',
                        content: `Shared file: ${attachment.title}`,
                        type: 'discussion',
                        attachments: [attachment.id]
                      });
                    }
                    setShowFileUploadDialog(false);
                    setSelectedFile(null);
                  }
                }}
              >
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showVoiceMessageDialog} onOpenChange={setShowVoiceMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Voice Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={() => {
                    if (isRecording) {
                      stopVoiceRecording();
                      setShowVoiceMessageDialog(false);
                    } else {
                      startVoiceRecording();
                    }
                  }}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {isRecording ? 'Recording...' : 'Click to start recording'}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showVideoCallDialog} onOpenChange={setShowVideoCallDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Video Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg">
                {/* Video call interface */}
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (isInCall) {
                      endVideoCall();
                      setShowVideoCallDialog(false);
                    } else {
                      startVideoCall();
                    }
                  }}
                >
                  {isInCall ? (
                    <PhoneOff className="w-6 h-6" />
                  ) : (
                    <Phone className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    // Toggle microphone
                  }}
                >
                  <Mic className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    // Toggle camera
                  }}
                >
                  <Video className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add new dialogs for chat room features */}
        <Dialog open={showCreatePollDialog} onOpenChange={setShowCreatePollDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Poll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Question</Label>
                <Input
                  placeholder="Enter poll question"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                />
              </div>
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...newPoll.options];
                          newOptions[index] = { ...option, text: e.target.value };
                          setNewPoll(prev => ({ ...prev, options: newOptions }));
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = newPoll.options.filter((_, i) => i !== index);
                          setNewPoll(prev => ({ ...prev, options: newOptions }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewPoll(prev => ({
                      ...prev,
                      options: [...prev.options, { id: Math.random().toString(36).substr(2, 9), text: '', votes: [] }]
                    }))}
                  >
                    Add Option
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="multiple-choice"
                    checked={newPoll.isMultipleChoice}
                    onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, isMultipleChoice: checked as boolean }))}
                  />
                  <Label htmlFor="multiple-choice">Allow multiple choices</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="anonymous"
                    checked={newPoll.isAnonymous}
                    onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, isAnonymous: checked as boolean }))}
                  />
                  <Label htmlFor="anonymous">Anonymous poll</Label>
                </div>
              </div>
              <div>
                <Label>End Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={newPoll.endsAt ? format(newPoll.endsAt, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, endsAt: e.target.value ? new Date(e.target.value) : undefined }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePollDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRoom && newPoll.question && newPoll.options.length > 0) {
                    createPoll(selectedRoom.id, {
                      ...newPoll,
                      createdBy: 'current-user'
                    });
                    setShowCreatePollDialog(false);
                    setNewPoll({
                      question: '',
                      options: [],
                      isMultipleChoice: false,
                      isAnonymous: false
                    });
                  }
                }}
              >
                Create Poll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Enter announcement content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt ? format(newAnnouncement.expiresAt, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expiresAt: e.target.value ? new Date(e.target.value) : undefined }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRoom && newAnnouncement.content) {
                    createAnnouncement(selectedRoom.id, {
                      ...newAnnouncement,
                      createdBy: 'current-user'
                    });
                    setShowAnnouncementDialog(false);
                    setNewAnnouncement({ content: '' });
                  }
                }}
              >
                Post Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEmojiDialog} onOpenChange={setShowEmojiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Emoji</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Enter emoji name"
                  value={newEmoji.name}
                  onChange={(e) => setNewEmoji(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  placeholder="Enter image URL"
                  value={newEmoji.url}
                  onChange={(e) => setNewEmoji(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              {newEmoji.url && (
                <div className="flex justify-center">
                  <img
                    src={newEmoji.url}
                    alt={newEmoji.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmojiDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRoom && newEmoji.name && newEmoji.url) {
                    addCustomEmoji(selectedRoom.id, {
                      ...newEmoji,
                      createdBy: 'current-user'
                    });
                    setShowEmojiDialog(false);
                    setNewEmoji({ name: '', url: '' });
                  }
                }}
              >
                Add Emoji
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add buttons to the chat room header */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreatePollDialog(true)}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnnouncementDialog(true)}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmojiDialog(true)}
          >
            <Smile className="w-4 h-4 mr-2" />
            Add Emoji
          </Button>
        </div>
      </div>
    );
  };

  // New functions for enhanced class features
  const addAttachment = (attachment: Attachment) => {
    setAttachments([...attachments, attachment]);
    addNotification({
      title: 'Attachment Added',
      message: `New attachment "${attachment.title}" has been added.`,
      type: 'resource'
    });
  };

  const createRubric = (rubric: Rubric) => {
    setRubrics([...rubrics, rubric]);
    addNotification({
      title: 'Rubric Created',
      message: `New rubric "${rubric.name}" has been created.`,
      type: 'resource'
    });
  };

  const gradeAssignment = (grade: Grade) => {
    setGrades([...grades, grade]);
    // Update gradebook
    const studentEntry = gradebook.find(entry => entry.studentId === grade.studentId);
    if (studentEntry) {
      const updatedEntry = {
        ...studentEntry,
        assignments: [
          ...studentEntry.assignments.filter(a => a.assignmentId !== grade.assignmentId),
          {
            assignmentId: grade.assignmentId,
            grade: grade.points,
            maxPoints: grade.maxPoints,
            submittedAt: new Date(),
            gradedAt: new Date()
          }
        ]
      };
      setGradebook(gradebook.map(entry => 
        entry.studentId === grade.studentId ? updatedEntry : entry
      ));
    }
    addNotification({
      title: 'Assignment Graded',
      message: `Assignment has been graded with ${grade.points}/${grade.maxPoints} points.`,
      type: 'resource'
    });
  };

  const sendMessage = (message: Message) => {
    setMessages([...messages, message]);
    addNotification({
      title: 'New Message',
      message: `New ${message.type} message has been posted.`,
      type: 'resource'
    });
  };

  const addMessageReply = (messageId: string, reply: Message['replies'][0]) => {
    setMessages(messages.map(message => 
      message.id === messageId
        ? { ...message, replies: [...(message.replies || []), reply] }
        : message
    ));
    addNotification({
      title: 'New Reply',
      message: 'A new reply has been added to the message.',
      type: 'resource'
    });
  };

  const addMessageReaction = (messageId: string, userId: string, type: string) => {
    setMessages(messages.map(message => 
      message.id === messageId
        ? { ...message, reactions: [...(message.reactions || []), { userId, type }] }
        : message
    ));
  };

  // Chat Room Management
  const createChatRoom = (room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRoom: ChatRoom = {
      ...room,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        isPrivate: false,
        allowInvites: true,
        requireApproval: false,
        allowFileSharing: true,
        allowVoiceMessages: true,
        allowVideoCalls: true,
        allowReactions: true,
        allowPolls: true,
        allowThreading: true,
        slowMode: undefined,
        maxParticipants: undefined,
        autoArchive: false,
        archiveAfter: undefined,
        welcomeMessage: undefined,
        rules: [],
        ...room.settings
      },
      participants: [
        {
          userId: 'current-user',
          role: 'admin',
          joinedAt: new Date(),
          permissions: {
            canInvite: true,
            canPin: true,
            canDelete: true,
            canEdit: true,
            canMute: true
          }
        }
      ]
    };
    setChatRooms([...chatRooms, newRoom]);
  };

  const inviteToRoom = (roomId: string, userId: string) => {
    const invite: RoomInvite = {
      id: crypto.randomUUID(),
      roomId,
      invitedBy: 'current-user',
      invitedUser: userId,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    setRoomInvites([...roomInvites, invite]);
    addNotification({
      title: 'Room Invitation Sent',
      message: `You've invited a user to join your chat room`,
      type: 'resource'
    });
  };

  const handleRoomInvite = (inviteId: string, accept: boolean) => {
    const invite = roomInvites.find(i => i.id === inviteId);
    if (!invite) return;

    if (accept) {
      const room = chatRooms.find(r => r.id === invite.roomId);
      if (room) {
        const updatedRoom = {
          ...room,
          participants: [
            ...room.participants,
            {
              userId: invite.invitedUser,
              role: 'member',
              joinedAt: new Date()
            }
          ]
        };
        setChatRooms(chatRooms.map(r => r.id === room.id ? updatedRoom : r));
      }
    }

    setRoomInvites(roomInvites.map(i => 
      i.id === inviteId 
        ? { ...i, status: accept ? 'accepted' : 'rejected' }
        : i
    ));
  };

  const sendRoomMessage = (message: Omit<RoomMessage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMessage: RoomMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setRoomMessages(prev => [...prev, newMessage]);
  };

  const pinMessage = (messageId: string) => {
    if (!selectedRoom) return;
    const updatedRoom = {
      ...selectedRoom,
      pinnedMessages: [...(selectedRoom.pinnedMessages || []), messageId]
    };
    setChatRooms(chatRooms.map(r => r.id === selectedRoom.id ? updatedRoom : r));
  };

  const editMessage = (messageId: string, newContent: string) => {
    setRoomMessages(roomMessages.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          content: newContent,
          isEdited: true,
          editHistory: [
            ...(message.editHistory || []),
            {
              content: message.content,
              editedAt: new Date(),
              editedBy: 'current-user'
            }
          ]
        };
      }
      return message;
    }));
  };

  const createTopic = (roomId: string, topic: { name: string; description?: string }) => {
    const newTopic: ChatRoom['topics'][0] = {
      id: Math.random().toString(36).substr(2, 9),
      name: topic.name,
      description: topic.description,
      createdBy: 'current-user',
      createdAt: new Date(),
      isLocked: false,
      isAnnouncement: false
    };

    setChatRooms(chatRooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          topics: [...(room.topics || []), newTopic]
        };
      }
      return room;
    }));
  };

  const updateRoomParticipant = (roomId: string, userId: string, role: 'admin' | 'moderator' | 'member') => {
    setChatRooms(chatRooms.map(room => {
      if (room.id === roomId) {
        const updatedParticipants = room.participants.map(p => {
          if (p.userId === userId) {
            return {
              ...p,
              role: role as 'admin' | 'moderator' | 'member'
            };
          }
          return p;
        });
        return {
          ...room,
          participants: updatedParticipants
        };
      }
      return room;
    }));
  };

  const removeRoomParticipant = (roomId: string, userId: string) => {
    setChatRooms(chatRooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          participants: room.participants.filter(p => p.userId !== userId)
        };
      }
      return room;
    }));
  };

  const handleFileUpload = async (file: File) => {
    // Simulate file upload
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      type: 'upload',
      url: URL.createObjectURL(file),
      title: file.name,
      size: file.size,
      uploadedBy: 'current-user',
      uploadedAt: new Date()
    };
    return attachment;
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Implement voice recording stop logic
  };

  const startVideoCall = () => {
    setIsInCall(true);
    // Implement video call logic
  };

  const endVideoCall = () => {
    setIsInCall(false);
    // Implement video call end logic
  };

  // Add new functions for enhanced chat features
  const createPoll = (roomId: string, poll: Omit<ChatRoom['polls'][0], 'id' | 'createdAt'>) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const newPoll = {
          ...poll,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        };
        return {
          ...room,
          polls: [...(room.polls || []), newPoll]
        };
      }
      return room;
    }));
  };

  const voteInPoll = (roomId: string, pollId: string, optionId: string, userId: string) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          polls: room.polls?.map(poll => {
            if (poll.id === pollId) {
              return {
                ...poll,
                options: poll.options.map(option => {
                  if (option.id === optionId) {
                    return {
                      ...option,
                      votes: [...option.votes, userId]
                    };
                  }
                  return option;
                })
              };
            }
            return poll;
          })
        };
      }
      return room;
    }));
  };

  const createAnnouncement = (roomId: string, announcement: Omit<ChatRoom['announcements'][0], 'id' | 'createdAt'>) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const newAnnouncement = {
          ...announcement,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        };
        return {
          ...room,
          announcements: [...(room.announcements || []), newAnnouncement]
        };
      }
      return room;
    }));
  };

  const addCustomEmoji = (roomId: string, emoji: Omit<ChatRoom['customEmojis'][0], 'id'>) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const newEmoji = {
          ...emoji,
          id: Math.random().toString(36).substr(2, 9)
        };
        return {
          ...room,
          customEmojis: [...(room.customEmojis || []), newEmoji]
        };
      }
      return room;
    }));
  };

  const updateParticipantStatus = (roomId: string, userId: string, status: 'online' | 'offline' | 'away') => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          participants: room.participants.map(p => 
            p.userId === userId ? { ...p, status, lastSeen: new Date() } : p
          )
        };
      }
      return room;
    }));
  };

  const muteParticipant = (roomId: string, userId: string, duration: number) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          participants: room.participants.map(p => 
            p.userId === userId ? { ...p, mutedUntil: new Date(Date.now() + duration) } : p
          )
        };
      }
      return room;
    }));
  };

  // Add UI components for new features
  const renderChatRoomFeatures = (room: ChatRoom) => (
    <div className="flex flex-col h-full">
      {/* Room Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div>
            <h3 className="font-semibold">{room.name}</h3>
            <p className="text-sm text-muted-foreground">
              {room.participants.length} members • {room.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowRoomSettingsDialog(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowParticipantsDialog(true)}>
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/50">
          <div className="p-4">
            <h4 className="font-medium mb-2">Topics</h4>
            <div className="space-y-1">
              {room.topics?.map((topic) => (
                <button
                  key={topic.id}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Hash className="w-4 h-4" />
                  <span className="truncate">{topic.name}</span>
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowCreateTopicDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </div>
          </div>

          <div className="p-4 border-t">
            <h4 className="font-medium mb-2">Pinned Messages</h4>
            <div className="space-y-2">
              {room.pinnedMessages?.map((messageId) => {
                const message = roomMessages.find((m) => m.id === messageId);
                if (!message) return null;
                return (
                  <div key={message.id} className="p-2 rounded-md bg-muted">
                    <p className="text-sm line-clamp-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {roomMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.senderId === 'current-user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-primary" />
                </div>
                <div
                  className={`max-w-[70%] ${
                    message.senderId === 'current-user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-3`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {room.participants.find((p) => p.userId === message.senderId)?.customTitle ||
                        'User'}
                    </span>
                    <span className="text-xs opacity-70">
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment}
                          className="aspect-video rounded-md overflow-hidden bg-background"
                        >
                          <img
                            src={attachment}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction) => (
                        <span
                          key={reaction.userId}
                          className="text-xs bg-background/50 rounded-full px-2 py-1"
                        >
                          {reaction.type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowEmojiDialog(true)}>
                <Smile className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowFileUploadDialog(true)}>
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage.content || ''}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        sendRoomMessage({
                          roomId: room.id,
                          content: newMessage,
                          type: 'discussion',
                          senderId: 'current-user'
                        });
                        setNewMessage('');
                      }
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendRoomMessage({
                          roomId: room.id,
                          content: newMessage,
                          type: 'discussion',
                          senderId: 'current-user'
                        });
                        setNewMessage('');
                      }
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'planner' | 'analytics' | 'study' | 'classes')}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="planner">Daily Planner</TabsTrigger>
          <TabsTrigger value="study">Study Plan</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* List View content restored here */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">To-Do List</h1>
              <p className="text-muted-foreground mt-2">
                {pendingCount} pending, {completedCount} completed
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-8"
                />
              </div>
              <div className="relative">
                <Input
                  placeholder="Add new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="w-64"
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                {suggestions.length > 0 && newTodo.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-popover border rounded-md shadow-lg mt-1 p-2">
                    <div className="text-sm text-muted-foreground mb-1">Suggestions:</div>
                    {suggestions.map((suggestion: string, index: number) => (
                      <div
                        key={index}
                        className="cursor-pointer hover:bg-accent p-1 rounded"
                        onClick={() => setNewTodo(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={addTodo}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopVoiceInput : startVoiceInput}
                title="Voice Input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant={isFocusMode ? "default" : "outline"}
                onClick={toggleFocusMode}
                title="Focus Mode"
              >
                <Timer className="w-4 h-4 mr-2" />
                {isFocusMode && focusTimer !== null ? formatTime(focusTimer) : "Focus Mode"}
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Select value={filter} onValueChange={(value: 'all' | 'active' | 'completed') => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active Tasks</SelectItem>
                <SelectItem value="completed">Completed Tasks</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span className={`mr-2 ${category.color}`}>●</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px]">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                  Sort by {sortField}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortField('priority')}>
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField('dueDate')}>
                  Due Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField('createdAt')}>
                  Created Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField('title')}>
                  Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>

          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredAndSortedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-md transition-shadow",
                      isFocusMode && !todo.completed && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                      />
                      {editingId === todo.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                          onBlur={() => saveEdit(todo.id)}
                          autoFocus
                          className="w-64"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className={cn(
                            todo.completed ? 'line-through text-muted-foreground' : '',
                            priorityColors[todo.priority]
                          )}>
                            {todo.title}
                          </span>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            {todo.category && (
                              <span>{todo.category}</span>
                            )}
                            {todo.dueDate && (
                              <span>Due: {format(todo.dueDate, 'MMM dd, yyyy')}</span>
                            )}
                            {todo.recurring && (
                              <span className="flex items-center">
                                <Repeat className="w-3 h-3 mr-1" />
                                {todo.recurring.type} ({todo.recurring.interval})
                              </span>
                            )}
                          </div>
                          {showNotes === todo.id ? (
                            <div className="mt-2">
                              <Input
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add notes..."
                                className="w-64"
                              />
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => updateNotes(todo.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowNotes(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : todo.notes ? (
                            <p className="text-sm text-muted-foreground mt-1">{todo.notes}</p>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" title="Set priority">
                            <Flag className={cn("w-4 h-4", priorityColors[todo.priority])} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => updatePriority(todo.id, 'low')}
                            >
                              <Flag className="w-4 h-4 text-blue-500 mr-2" />
                              Low Priority
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => updatePriority(todo.id, 'medium')}
                            >
                              <Flag className="w-4 h-4 text-yellow-500 mr-2" />
                              Medium Priority
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => updatePriority(todo.id, 'high')}
                            >
                              <Flag className="w-4 h-4 text-red-500 mr-2" />
                              High Priority
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" title="Set due date">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={todo.dueDate}
                            onSelect={(date) => updateDueDate(todo.id, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" title="Set recurring">
                            <Repeat className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setRecurring(todo.id, 'daily', 1)}
                            >
                              Daily
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setRecurring(todo.id, 'weekly', 1)}
                            >
                              Weekly
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setRecurring(todo.id, 'monthly', 1)}
                            >
                              Monthly
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" title="Add category">
                            <Tag className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                          <div className="space-y-2">
                            {categories.map(category => (
                              <Button
                                key={category.id}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => updateTodoCategory(todo.id, category.id)}
                              >
                                <span className={`mr-2 ${category.color}`}>●</span>
                                {category.name}
                              </Button>
                            ))}
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setEditingCategory(null);
                                setNewCategory({ name: '', color: 'text-blue-500' });
                                setShowCategoryDialog(true);
                              }}
                            >
                              <FolderPlus className="w-4 h-4 mr-2" />
                              New Category
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Add notes"
                        onClick={() => {
                          setShowNotes(todo.id);
                          setNoteText(todo.notes || '');
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="icon" title="Set reminder">
                        <Bell className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete task"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title={todo.isLocked ? "Unlock task" : "Lock task"}
                        onClick={() => {
                          setTodos(todos.map(t =>
                            t.id === todo.id ? { ...t, isLocked: !t.isLocked } : t
                          ));
                        }}
                      >
                        {todo.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAndSortedTodos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found. Add a new task to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showGoalForm && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Add New Goal</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Goal title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                  <div className="flex gap-4">
                    <Button onClick={addGoal}>Add Goal</Button>
                    <Button variant="ghost" onClick={() => setShowGoalForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {renderCategoryDialog()}
        </TabsContent>

        <TabsContent value="planner">
          {renderPlannerView()}
        </TabsContent>

        <TabsContent value="study">
          {renderStudyView()}
        </TabsContent>

        <TabsContent value="classes">
          {renderClassManagementView()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsView()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 