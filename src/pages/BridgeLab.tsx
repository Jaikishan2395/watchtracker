import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Upload, Users, Lightbulb, BookOpen, Trophy, ShieldCheck, UserCheck, MessageCircle, FileText, UserCircle, ArrowLeft, User, Globe, Code, Award, Settings, Clock, Filter, Search, ChevronDown, Plus, X, Check, RotateCcw, BarChart3, Smile, Play, Video } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import BridgeLabLogo from '../assets/bridgelab_logo.png';
import ImageEditor from '../components/ImageEditor';
import { toast } from '../hooks/use-toast';
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogTrigger as ConfirmDialogTrigger } from '../components/ui/dialog';
import { Dialog as ConferenceDialog, DialogContent as ConferenceDialogContent, DialogHeader as ConferenceDialogHeader, DialogTitle as ConferenceDialogTitle } from '../components/ui/dialog';

// Add this at the top of the file (after imports) to declare the YT namespace and Player type for TypeScript
interface YouTubePlayer {
  setVolume(volume: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

// 1. BlogPost and Comment types
interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface PollOption {
  id: number;
  text: string;
  votes: number;
  votedBy: string[];
}

interface BlogPost {
  id: number;
  title: string;
  content: string; // HTML string for rich text
  author: string;
  avatar: string;
  tags: string[];
  createdAt: string;
  reactions: Record<string, string[]>;
  bookmarked: boolean;
  comments: Comment[];
  media?: { type: 'image' | 'video', file: File, url: string }[];
  poll?: {
    question: string;
    options: PollOption[];
    votedByUser?: number; // index of option user voted for, or null
  };
}

// 2. Dummy posts data
const dummyPosts: BlogPost[] = [
  {
    id: 1,
    title: 'How to Build a Smart Campus App',
    content: '<p>This is a <b>rich text</b> post about building a smart campus app. <a href="#">Read more...</a></p>',
    author: 'Alice',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    tags: ['Tech', 'Campus', 'React'],
    createdAt: '2024-06-01T10:00:00Z',
    reactions: {
      '😊': ['Bob'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [
      {
        id: 1,
        author: 'Bob',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        content: 'Great idea! Would love to join.',
        createdAt: '2024-06-01T11:00:00Z',
        replies: [
          {
            id: 2,
            author: 'Alice',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            content: 'Thanks Bob! Let\'s connect.',
            createdAt: '2024-06-01T11:10:00Z',
          },
        ],
      },
    ],
    poll: {
      question: 'Which feature would you like to see first in the Smart Campus App?',
      options: [
        { id: 1, text: 'Real-time Bus Tracking', votes: 8, votedBy: ['Bob', 'Carol', 'David'] },
        { id: 2, text: 'Campus Food Ordering', votes: 12, votedBy: ['Alice', 'Emma', 'Frank'] },
        { id: 3, text: 'Study Room Booking', votes: 5, votedBy: ['Grace'] },
        { id: 4, text: 'Event Notifications', votes: 3, votedBy: ['Henry'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 2,
    title: 'Why Eco Startups Matter',
    content: '<p>Let\'s talk about <i>sustainability</i> and eco-friendly startups. 🌱</p>',
    author: 'Bob',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    tags: ['Eco', 'Startup'],
    createdAt: '2024-06-02T09:00:00Z',
    reactions: {
      '😊': ['Alice'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'What\'s the biggest challenge for eco startups?',
      options: [
        { id: 1, text: 'Funding & Investment', votes: 4, votedBy: ['Alice', 'David'] },
        { id: 2, text: 'Consumer Awareness', votes: 2, votedBy: ['Carol'] },
        { id: 3, text: 'Regulatory Hurdles', votes: 1, votedBy: ['Emma'] }
      ],
      votedByUser: 0 // Bob voted for the first option
    }
  },
  {
    id: 3,
    title: 'Best Programming Language for Beginners',
    content: '<p>Let\'s discuss the best programming language for students starting their coding journey.</p>',
    author: 'Carol',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    tags: ['Programming', 'Education', 'Python'],
    createdAt: '2024-06-03T14:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob'],
      '😢': [],
      '😡': [],
      '😮': ['David'],
      '❤️': [],
      '🤔': ['Emma']
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which programming language should beginners learn first?',
      options: [
        { id: 1, text: 'Python', votes: 15, votedBy: ['Alice', 'Bob', 'David', 'Emma', 'Frank'] },
        { id: 2, text: 'JavaScript', votes: 8, votedBy: ['Carol', 'Grace'] },
        { id: 3, text: 'Java', votes: 3, votedBy: ['Henry'] },
        { id: 4, text: 'C++', votes: 2, votedBy: ['Ivy'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 4,
    title: 'Future of Remote Work',
    content: '<p>How will remote work evolve in the next 5 years? Share your thoughts!</p>',
    author: 'David',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    tags: ['Remote Work', 'Future', 'Technology'],
    createdAt: '2024-06-04T11:00:00Z',
    reactions: {
      '😊': ['Alice', 'Carol'],
      '😢': [],
      '😡': [],
      '😮': ['Bob'],
      '❤️': ['Emma'],
      '🤔': ['Frank']
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'What will be the dominant work model in 2029?',
      options: [
        { id: 1, text: 'Hybrid (2-3 days office)', votes: 18, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma'] },
        { id: 2, text: 'Fully Remote', votes: 7, votedBy: ['Frank', 'Grace'] },
        { id: 3, text: 'Fully Office-based', votes: 2, votedBy: ['Henry'] },
        { id: 4, text: 'Flexible (employee choice)', votes: 12, votedBy: ['Ivy', 'Jack'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 5,
    title: 'AI in Education',
    content: '<p>How can artificial intelligence transform the way we learn?</p>',
    author: 'Emma',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    tags: ['AI', 'Education', 'Innovation'],
    createdAt: '2024-06-05T16:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob', 'David'],
      '😢': [],
      '😡': [],
      '😮': ['Carol', 'Frank'],
      '❤️': ['Grace'],
      '🤔': ['Henry']
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'Which AI application will have the biggest impact on education?',
      options: [
        { id: 1, text: 'Personalized Learning', votes: 22, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma'] },
        { id: 2, text: 'Automated Grading', votes: 5, votedBy: ['Frank', 'Grace'] },
        { id: 3, text: 'Virtual Tutors', votes: 8, votedBy: ['Henry', 'Ivy'] },
        { id: 4, text: 'Content Generation', votes: 3, votedBy: ['Jack'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 6,
    title: 'Test User Poll',
    content: '<p>This is a test poll created by the user to verify the polls section functionality.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'User Poll'],
    createdAt: '2024-06-06T12:00:00Z',
    reactions: {
      '😊': [],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'What is your favorite programming language?',
      options: [
        { id: 1, text: 'JavaScript', votes: 3, votedBy: ['Alice', 'Bob', 'Carol'] },
        { id: 2, text: 'Python', votes: 5, votedBy: ['David', 'Emma', 'Frank', 'Grace', 'Henry'] },
        { id: 3, text: 'TypeScript', votes: 2, votedBy: ['Ivy', 'Jack'] },
        { id: 4, text: 'Java', votes: 1, votedBy: ['Kate'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 7,
    title: 'Another User Poll',
    content: '<p>This is another test poll that has been voted on to show different states.</p>',
    author: 'You',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: ['Test', 'Voted'],
    createdAt: '2024-06-07T10:00:00Z',
    reactions: {
      '😊': ['Alice'],
      '😢': [],
      '😡': [],
      '😮': [],
      '❤️': [],
      '🤔': []
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'Which framework do you prefer for web development?',
      options: [
        { id: 1, text: 'React', votes: 8, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry'] },
        { id: 2, text: 'Vue.js', votes: 3, votedBy: ['Ivy', 'Jack', 'Kate'] },
        { id: 3, text: 'Angular', votes: 2, votedBy: ['Liam', 'Mia'] },
        { id: 4, text: 'Svelte', votes: 1, votedBy: ['Noah'] }
      ],
      votedByUser: 0 // User voted for React
    }
  },
  {
    id: 8,
    title: 'Community Poll: Best Study Method',
    content: '<p>What study method works best for you during exam season?</p>',
    author: 'Study Group Admin',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    tags: ['Study', 'Education', 'Community'],
    createdAt: '2024-06-08T14:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob', 'Carol'],
      '😢': [],
      '😡': [],
      '😮': ['David'],
      '❤️': ['Emma'],
      '🤔': ['Frank']
    },
    bookmarked: false,
    comments: [],
    poll: {
      question: 'What is your most effective study method?',
      options: [
        { id: 1, text: 'Pomodoro Technique', votes: 12, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam'] },
        { id: 2, text: 'Group Study Sessions', votes: 8, votedBy: ['Mia', 'Noah', 'Olivia', 'Parker', 'Quinn', 'Riley', 'Sophia', 'Taylor'] },
        { id: 3, text: 'Mind Mapping', votes: 5, votedBy: ['Uma', 'Victor', 'Willow', 'Xander', 'Yara'] },
        { id: 4, text: 'Practice Tests', votes: 15, votedBy: ['Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan', 'Kai', 'Luna', 'Morgan', 'Nova'] }
      ],
      votedByUser: undefined
    }
  },
  {
    id: 9,
    title: 'Tech Trends 2024',
    content: '<p>Let\'s discuss the most exciting technology trends for 2024!</p>',
    author: 'Tech Enthusiast',
    avatar: 'https://randomuser.me/api/portraits/men/88.jpg',
    tags: ['Technology', 'Trends', '2024'],
    createdAt: '2024-06-09T09:00:00Z',
    reactions: {
      '😊': ['Alice', 'Bob'],
      '😢': [],
      '😡': [],
      '😮': ['Carol', 'David', 'Emma'],
      '❤️': ['Frank', 'Grace'],
      '🤔': ['Henry']
    },
    bookmarked: true,
    comments: [],
    poll: {
      question: 'Which technology trend excites you most in 2024?',
      options: [
        { id: 1, text: 'Artificial Intelligence & ML', votes: 25, votedBy: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Parker', 'Quinn', 'Riley', 'Sophia', 'Taylor', 'Uma', 'Victor', 'Willow', 'Xander', 'Yara'] },
        { id: 2, text: 'Web3 & Blockchain', votes: 8, votedBy: ['Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray'] },
        { id: 3, text: 'Quantum Computing', votes: 6, votedBy: ['Harper', 'Indigo', 'Jordan', 'Kai', 'Luna', 'Morgan'] },
        { id: 4, text: 'Augmented Reality', votes: 4, votedBy: ['Nova', 'Owen', 'Peyton', 'Quinn'] }
      ],
      votedByUser: undefined
    }
  }
];

const branchOptions = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Other'];

const tabItems = [
  { value: 'discover', label: 'Discover', icon: <Lightbulb className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'my-polls', label: 'My Polls', icon: <Trophy className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'teammatch', label: 'TeamMatch', icon: <Users className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'circles', label: 'Circles', icon: <MessageCircle className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'pitch', label: 'Pitch', icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'mentor', label: 'Mentor', icon: <UserCheck className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'profile', label: 'Profile', icon: <User className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'new-post', label: 'New Post', icon: <Plus className="w-6 h-6" strokeWidth={1.5} /> },
];

// Utility function to extract all YouTube video IDs from a string
function extractAllYouTubeVideoIds(text: string): string[] {
  // Regex for various YouTube URL formats
  const regex = /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/))([\w-]{11})/g;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

const BridgeLab: React.FC = () => {
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [tab, setTab] = useState('discover');
  const prevTabRef = useRef('discover');
  // Only update prevTabRef if not on 'new-post'
  useEffect(() => {
    if (tab !== 'new-post') {
      prevTabRef.current = tab;
    }
  }, [tab]);

  // Open dialog when 'new-post' tab is selected
  useEffect(() => {
    if (tab === 'new-post' && !showNewPostDialog) {
      setShowNewPostDialog(true);
    }
  }, [tab, showNewPostDialog]);

  // Restore previous tab after dialog closes
  useEffect(() => {
    if (!showNewPostDialog && tab === 'new-post') {
      setTab(prevTabRef.current);
    }
  }, [showNewPostDialog, tab]);

  const [posts, setPosts] = useState<BlogPost[]>(dummyPosts);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newMedia, setNewMedia] = useState<{ type: 'image' | 'video', file: File, url: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Profile state
  const [profileTab, setProfileTab] = useState('activity');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Your Name',
    department: 'Computer Science',
    year: 'Year 3',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    email: 'your.email@college.edu',
    linkedin: 'linkedin.com/in/yourprofile',
    github: 'github.com/yourusername',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX', 'Python', 'Machine Learning'],
    stats: {
      postsCreated: 12,
      commentsMade: 47,
      likesReceived: 156,
      projectsJoined: 8
    },
    preferences: {
      emailNotifications: true,
      publicProfile: true,
      mentorRequests: false
    },
    achievements: [
      { title: 'Top Contributor', description: 'Most active this month', icon: 'Trophy', color: 'yellow' },
      { title: 'Team Player', description: 'Joined 5+ projects', icon: 'Users', color: 'blue' },
      { title: 'Innovator', description: 'Created 10+ ideas', icon: 'Lightbulb', color: 'green' }
    ],
    recentActivity: [
      { action: 'Posted "Smart Campus App Ideas"', time: '2 hours ago', type: 'post' },
      { action: 'Joined Eco Startup Project', time: '1 day ago', type: 'join' },
      { action: 'Commented on "AR Navigation"', time: '3 days ago', type: 'comment' }
    ]
  });

  const [editProfile, setEditProfile] = useState(profile);

  // Profile tab items
  const profileTabItems = [
    { value: 'activity', label: 'Activity Stats', icon: <Trophy className="w-5 h-5" /> },
    { value: 'skills', label: 'Skills & Expertise', icon: <Code className="w-5 h-5" /> },
    { value: 'contact', label: 'Contact Info', icon: <MessageCircle className="w-5 h-5" /> },
    { value: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> },
    { value: 'preferences', label: 'Preferences', icon: <Settings className="w-5 h-5" /> },
    { value: 'recent', label: 'Recent Activity', icon: <Clock className="w-5 h-5" /> },
  ];

  // Save profile function
  const saveProfile = () => {
    setProfile(editProfile);
    setShowEditProfile(false);
  };

  // Add/remove skill
  const addSkill = (skill: string) => {
    if (skill && !editProfile.skills.includes(skill)) {
      setEditProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skill: string) => {
    setEditProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // TeamMatch state
  const [teamSearch, setTeamSearch] = useState('');
  const [teamSkillFilter, setTeamSkillFilter] = useState<string[]>([]);
  const [teamDeptFilter, setTeamDeptFilter] = useState<string[]>([]);
  const [teamYearFilter, setTeamYearFilter] = useState<string>('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  // Advanced Filters toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Emoji dropdown state
  const [openEmojiDropdown, setOpenEmojiDropdown] = useState<number | null>(null);
  
  // More options dropdown state
  const [openMoreOptions, setOpenMoreOptions] = useState<number | null>(null);
  
  // Dummy team members data
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', skills: ['React', 'TypeScript', 'UI/UX'], department: 'CSE', year: '3rd Year', bio: 'Passionate about frontend development and user experience design.' },
    { id: 2, name: 'Bob Smith', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', skills: ['Python', 'Machine Learning', 'Data Science'], department: 'CSE', year: '4th Year', bio: 'ML enthusiast with experience in computer vision projects.' },
    { id: 3, name: 'Carol Davis', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', skills: ['Node.js', 'MongoDB', 'Backend'], department: 'ECE', year: '3rd Year', bio: 'Backend developer interested in scalable architecture.' },
    { id: 4, name: 'David Wilson', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', skills: ['Flutter', 'Mobile Dev', 'Firebase'], department: 'CSE', year: '2nd Year', bio: 'Mobile app developer with 3 published apps.' },
    { id: 5, name: 'Emma Brown', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', skills: ['Java', 'Spring Boot', 'Microservices'], department: 'IT', year: '4th Year', bio: 'Backend specialist with expertise in enterprise applications.' },
    { id: 6, name: 'Frank Miller', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', skills: ['C++', 'Game Development', 'Unity'], department: 'CSE', year: '3rd Year', bio: 'Game developer passionate about creating immersive experiences.' },
    { id: 7, name: 'Grace Lee', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', skills: ['DevOps', 'Docker', 'Kubernetes'], department: 'ECE', year: '4th Year', bio: 'DevOps engineer focused on automation and cloud infrastructure.' },
    { id: 8, name: 'Henry Chen', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', skills: ['Blockchain', 'Solidity', 'Web3'], department: 'CSE', year: '2nd Year', bio: 'Blockchain developer building decentralized applications.' },
  ];

  // All available skills
  const allSkills = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'FastAPI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'Machine Learning', 'Data Science', 'Computer Vision', 'NLP', 'Deep Learning',
    'UI/UX', 'Figma', 'Adobe XD', 'Sketch',
    'Flutter', 'React Native', 'Mobile Dev', 'iOS', 'Android',
    'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Blockchain', 'Solidity', 'Web3', 'Ethereum',
    'Game Development', 'Unity', 'Unreal Engine',
    'Microservices', 'REST API', 'GraphQL', 'WebSocket',
    'Git', 'GitHub', 'GitLab', 'CI/CD',
    'Agile', 'Scrum', 'Project Management'
  ];

  // All departments
  const allDepartments = [
    'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AI/ML', 'Data Science', 
    'Biotechnology', 'Chemical Engineering', 'Civil Engineering',
    'Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering',
    'Information Technology', 'Software Engineering', 'Cybersecurity',
    'Robotics', 'Automation', 'IoT', 'Embedded Systems'
  ];

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill => 
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !teamSkillFilter.includes(skill)
  );

  // Add skill to filter
  const addSkillToFilter = (skill: string) => {
    if (!teamSkillFilter.includes(skill)) {
      setTeamSkillFilter(prev => [...prev, skill]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  // Remove skill from filter
  const removeSkillFromFilter = (skill: string) => {
    setTeamSkillFilter(prev => prev.filter(s => s !== skill));
  };

  // Toggle department in filter
  const toggleDepartment = (dept: string) => {
    setTeamDeptFilter(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  useEffect(() => {
    if (sidebar) sidebar.setOpen(false);
  }, [sidebar]);

  // Debug tab changes
  useEffect(() => {
    console.log('Current tab:', tab);
    if (tab === 'polls') {
      console.log('🎯 POLLS TAB SELECTED!');
      console.log('Posts state:', posts);
      console.log('Posts with polls:', posts.filter(post => post.poll));
    }
  }, [tab, posts]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close skill dropdown if clicking outside
      if (!target.closest('.skill-dropdown-container')) {
        setShowSkillDropdown(false);
      }
      
      // Close department dropdown if clicking outside
      if (!target.closest('.dept-dropdown-container')) {
        setShowDeptDropdown(false);
      }
      
      // Close emoji dropdown if clicking outside
      if (!target.closest('.emoji-dropdown-container')) {
        setOpenEmojiDropdown(null);
      }
      
      // Close more options dropdown if clicking outside
      if (!target.closest('.more-options-container')) {
        setOpenMoreOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close other dropdown when one is opened
  const openSkillDropdown = () => {
    setShowSkillDropdown(true);
    setShowDeptDropdown(false);
  };

  const openDeptDropdown = () => {
    setShowDeptDropdown(true);
    setShowSkillDropdown(false);
  };

  // Filtering
  const filtered = posts.filter(post =>
    search === '' || post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase())
  );
  // No pagination: show all filtered posts

  // TeamMatch filtering logic
  const filteredTeamMembers = teamMembers.filter(member => 
    (teamSearch === '' || 
     member.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
     member.bio.toLowerCase().includes(teamSearch.toLowerCase())) &&
    (teamSkillFilter.length === 0 || 
     teamSkillFilter.some(skill => member.skills.includes(skill))) &&
    (teamDeptFilter.length === 0 || 
     teamDeptFilter.includes(member.department)) &&
    (teamYearFilter === '' || member.year === teamYearFilter)
  );

  // Like/bookmark handlers
  const toggleBookmark = (id: number) => setPosts(ps => ps.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));

  // Comment add (dummy)
  const addComment = (postId: number, text: string) => setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), author: 'You', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', content: text, createdAt: new Date().toISOString() }] } : p));

  // Media upload handlers
  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setNewMedia(prev => [...prev, { type: 'image', file, url }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setNewMedia(prev => [...prev, { type: 'video', file, url }]);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // --- Chat mock data and logic ---
  const chatRooms = [
    { id: '1', name: 'Team Alpha', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', type: 'group', unread: 2 },
    { id: '2', name: 'Mentor: Dr. Smith', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', type: 'mentor', unread: 0 },
    { id: '3', name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', type: 'direct', unread: 0 },
    { id: '4', name: 'Circle: Eco Innovators', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', type: 'group', unread: 1 },
  ];
  
  const chatMessages = {
    '1': [
      { id: 1, sender: 'Bob', text: 'Hey team, ready for the hackathon?', time: '2024-06-07T10:00:00Z' },
      { id: 2, sender: 'You', text: 'Absolutely! Let\'s sync up at 5pm.', time: '2024-06-07T10:01:00Z' },
      { id: 3, sender: 'Carol', text: 'I\'ll bring the snacks!', time: '2024-06-07T10:02:00Z' },
    ],
    '2': [
      { id: 1, sender: 'Dr. Smith', text: 'Let me know if you need help with your project proposal.', time: '2024-06-07T09:00:00Z' },
      { id: 2, sender: 'You', text: 'Thank you! I\'ll send a draft soon.', time: '2024-06-07T09:05:00Z' },
    ],
    '3': [
      { id: 1, sender: 'Alice Johnson', text: 'Can you review my code?', time: '2024-06-07T08:00:00Z' },
      { id: 2, sender: 'You', text: 'Sure, send it over!', time: '2024-06-07T08:01:00Z' },
    ],
    '4': [
      { id: 1, sender: 'Emma', text: 'Let\'s brainstorm eco-friendly ideas!', time: '2024-06-07T07:00:00Z' },
      { id: 2, sender: 'You', text: 'I have a few concepts to share.', time: '2024-06-07T07:05:00Z' },
    ],
  };
  
  const [activeRoom, setActiveRoom] = useState<string | null>(chatRooms[0].id);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const activeRoomObj = chatRooms.find(r => r.id === activeRoom);
  const activeRoomMessages = activeRoom ? messages[activeRoom] || [] : [];
  
  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeRoom) return;
    setMessages(prev => ({
      ...prev,
      [activeRoom]: [
        ...prev[activeRoom],
        { id: Date.now(), sender: 'You', text: messageText, time: new Date().toISOString() },
      ],
    }));
    setMessageText('');
  };

  // Add state to track the active comment input post
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

  // 3. DiscoverBlogFeed component
  const DiscoverBlogFeed = () => (
    <div className="w-full max-w-3xl mx-auto mt-10">
      {/* Blog Feed - Full page scroll, no inner scroll container */}
      <div className="flex flex-col gap-12">
        {filtered.filter(post => !post.poll).map(post => (
          <div key={post.id} className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-visible hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] mb-8 group">
            {/* Post Header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full border-2 border-neutral-200 shadow-sm hover:scale-105 transition-transform duration-200" />
              <div>
                  <h3 className="font-bold text-lg text-black hover:text-blue-600 transition-colors duration-200 cursor-pointer">{post.author}</h3>
                  <p className="text-sm text-neutral-500">{new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
              </div>
            </div>
              <div className="flex items-center gap-2">
                {/* Total Views */}
                <div className="flex items-center gap-1 text-neutral-500 text-sm bg-white px-3 py-1.5 rounded-full shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{Math.floor(Math.random() * 1000) + 500} views</span>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl font-extrabold mb-3 px-8 text-black tracking-wide font-brand uppercase mt-2">{post.title}</h2>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 px-8 mb-4">
              {post.tags && post.tags.map(tag => (
                <Badge key={tag} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold uppercase tracking-widest px-3 py-1 text-xs rounded-full shadow-sm border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 cursor-pointer">{tag}</Badge>
              ))}
            </div>
            
            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 mb-6">
                {post.media.map((media, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-200">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Post Media" className="w-full h-64 object-cover rounded-xl" />
                    ) : (
                      <video src={media.url} className="w-full h-64 object-cover rounded-xl" controls />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* YouTube video preview in Discover (multiple videos, with play/stop button below) */}
            {(() => {
              const videoIds = extractAllYouTubeVideoIds(post.content);
              if (!videoIds.length) return null;
              const previews = videoIds.map(videoId => {
                const isPlaying = currentlyPlaying && currentlyPlaying.postId === post.id && currentlyPlaying.videoId === videoId;
                return (
                  <div key={videoId} className="w-full max-w-md flex flex-col items-center">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-neutral-700 shadow-lg relative group mb-2">
                      {isPlaying ? (
                        <div style={{ width: '100%', height: '100%' }}>
                          <div id={`ytplayer_${post.id}_${videoId}`} style={{ width: '100%', height: '100%' }} />
                        </div>
                      ) : (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        className={`mb-2 px-8 py-3 rounded-full font-bold text-lg transition-all duration-200 flex items-center gap-2 shadow-lg border-2
                          ${isPlaying
                            ? 'bg-white text-black border-black hover:bg-black hover:text-white'
                            : 'bg-black text-white border-black hover:bg-white hover:text-black'}
                        `}
                        style={{ minWidth: 180 }}
                        onClick={() => {
                          if (isPlaying) {
                            setCurrentlyPlaying(null);
                          } else {
                            setCurrentlyPlaying({ postId: post.id, videoId });
                          }
                        }}
                      >
                        {isPlaying ? (
                          <>
                            <span className="inline-block w-5 h-5 mr-2 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="4" y="4" width="10" height="10" rx="2" fill="black" stroke="black" strokeWidth="2"/></svg>
                            </span>
                            Stop Video
                          </>
                        ) : (
                          <>
                            <span className="inline-block w-5 h-5 mr-2 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="6,4 14,9 6,14" fill="white"/></svg>
                            </span>
                            Play Video
                          </>
                        )}
                      </Button>
                      {/* Volume slider, only enabled when video is playing */}
                      {isPlaying && (
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={videoVolumes[`${post.id}_${videoId}`] ?? 100}
                          onChange={e => {
                            const newVolume = Number(e.target.value);
                            setVideoVolumes(v => ({ ...v, [`${post.id}_${videoId}`]: newVolume }));
                            const player = playerRefs.current[`${post.id}_${videoId}`];
                            if (player && typeof (player as { setVolume: (v: number) => void }).setVolume === 'function') {
                              (player as { setVolume: (v: number) => void }).setVolume(newVolume);
                            }
                          }}
                          className="w-32 h-2 accent-black cursor-pointer"
                          title="Volume"
                        />
                      )}
                    </div>
                  </div>
                );
              });
              return (
                <div className="my-4 flex flex-col items-center gap-6">
                  {previews}
                </div>
              );
            })()}
            {/* Content (YouTube links hidden) */}
            <div
              className="prose max-w-none mb-6 px-8 text-lg text-neutral-800 leading-relaxed"
              style={{ overflow: 'visible', maxHeight: 'none' }}
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]{11}/g, '')
              }}
            />
            
            {/* Enhanced Emoji Counts Display */}
            <div className="px-8 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                {Object.entries(post.reactions).map(([emoji, users]) => {
                  if (users.length > 0) {
                    const userReacted = users.includes('You');
                    return (
                      <div key={emoji} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer ${
                        userReacted 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-md' 
                          : 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200'
                      }`}>
                        <span className="text-lg">{emoji}</span>
                        <span className={`font-semibold ${
                          userReacted ? 'text-blue-700' : 'text-neutral-700'
                        }`}>
                          {users.length}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full border-t border-neutral-200 my-4" />
            
            {/* Actions */}
            <div className="flex items-center gap-4 px-8 pb-6">
              {/* Enhanced Emoji Reactions */}
              <div className="relative group emoji-dropdown-container">
                {/* Get the most popular reaction to show as main button */}
                {(() => {
                  const reactions = post.reactions;
                  const totalReactions = Object.values(reactions).reduce((sum, users) => sum + users.length, 0);
                  const mostPopularEmoji = Object.entries(reactions)
                    .sort(([,a], [,b]) => b.length - a.length)[0];
                  const userHasReacted = Object.values(reactions).some(users => users.includes('You'));
                  const userReactions = Object.entries(reactions).filter(([, users]) => users.includes('You'));
                  
                  return (
                    <button 
                      className={`flex items-center gap-2 text-lg font-bold transition-all px-4 py-2.5 rounded-full border-2 ${
                        userHasReacted 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-400 text-blue-800 shadow-lg' 
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-800'
                      } hover:shadow-xl hover:scale-105 duration-200 relative overflow-hidden`}
                      onClick={() => setOpenEmojiDropdown(openEmojiDropdown === post.id ? null : post.id)}
                      title={`${totalReactions} reactions • Click to choose your reaction`}
                    >
                      {/* User reaction indicator */}
                      {userHasReacted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                      
                      <span style={{fontSize: '1.4rem'}}>
                        {userReactions.length > 0 ? userReactions[0][0] : (totalReactions > 0 ? mostPopularEmoji[0] : '😊')}
                      </span>
                      <span className="text-sm font-semibold">
                        {totalReactions}
                      </span>
                      
                    </button>
                  );
                })()}
                
                {/* Enhanced Emoji Dropdown */}
                <div className={`absolute bottom-full left-0 mb-3 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl shadow-2xl p-4 transition-all duration-300 z-50 min-w-[320px] transform ${
                  openEmojiDropdown === post.id 
                    ? 'opacity-100 visible scale-100' 
                    : 'opacity-0 invisible scale-95'
                }`}>
                  
                  {/* Emoji Grid */}
                  <div className="flex gap-3 mb-2 justify-center">
                    {([
                      { emoji: '😊'},
                      { emoji: '😢'},
                      { emoji: '😡'},
                      { emoji: '😮'},
                      { emoji: '❤️'},
                      { emoji: '🤔' }
                    ] as const).map(({ emoji}) => {
                      const reactionCount = post.reactions[emoji].length;
                      const userReacted = post.reactions[emoji].includes('You');
                      const isMostPopular = reactionCount > 0 && reactionCount === Math.max(...Object.values(post.reactions).map(users => users.length));
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => {
                            const user = 'You';
                            const hasReacted = post.reactions[emoji].includes(user);
                            
                            setPosts(ps => ps.map(p => {
                              if (p.id !== post.id) return p;
                              
                              // Remove user from all other reactions first
                              const updatedReactions = Object.keys(p.reactions).reduce((acc: Record<string, string[]>, key) => {
                                acc[key] = p.reactions[key].filter(u => u !== user);
                                return acc;
                              }, {} as Record<string, string[]>);
                              
                              // Add user to the clicked emoji (toggle behavior)
                              if (!hasReacted) {
                                updatedReactions[emoji] = [...updatedReactions[emoji], user];
                              }
                              
                              return {
                                ...p,
                                reactions: updatedReactions
                              };
                            }));
                            
                            // Close the dropdown after selection
                            setOpenEmojiDropdown(null);
                            
                            // Show toast notification
                            toast({ 
                              title: hasReacted ? 'Reaction removed' : 'Reaction added!', 
                              description: `You ${hasReacted ? 'removed' : 'added'} ${emoji} reaction.` 
                            });
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md relative group ${
                            userReacted 
                              ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200' 
                              : 'border-2 border-transparent hover:border-neutral-200 hover:bg-neutral-50'
                          }`}
                          aria-label={`React with ${emoji}`}
                        >
                          {/* Selected indicator */}
                          {userReacted && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white shadow-lg animate-bounce">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                          
                          {/* Popular indicator */}
                          {isMostPopular && reactionCount > 0 && !userReacted && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-white">🔥</span>
                            </div>
                          )}
                          
                          <span style={{fontSize: '1.8rem'}} className={`transition-all duration-200 ${
                            userReacted ? 'scale-110' : 'group-hover:scale-110'
                          }`}>{emoji}</span>
                          
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-bold ${
                              userReacted ? 'text-blue-700' : 'text-neutral-700'
                            }`}>
                              {reactionCount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Comments Count */}
              <button 
                onClick={() => setActiveCommentPostId(post.id)}
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-neutral-50"
                title="View comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{post.comments.length} comments</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={() => {
                  toast({ 
                    title: 'Shared!', 
                    description: 'Post link copied to clipboard.' 
                  });
                }}
                className="flex items-center gap-2 text-neutral-400 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-green-50"
                title="Share post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm font-medium">Share</span>
              </button>

              {/* Bookmark Button */}
              <button 
                onClick={() => toggleBookmark(post.id)}
                className={`flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-full ${
                  post.bookmarked 
                    ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                    : 'text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
                title={post.bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              >
                <svg className="w-4 h-4" fill={post.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-sm font-medium">{post.bookmarked ? 'Saved' : 'Save'}</span>
              </button>

              {/* Repost Button */}
              <button 
                onClick={() => {
                  toast({ 
                    title: 'Reposted!', 
                    description: 'Your repost has been published.' 
                  });
                }}
                className="flex items-center gap-2 text-neutral-400 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-green-50"
                title="Repost"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-medium">Repost</span>
              </button>
            </div>
            
            {/* Comments */}
            <div className="bg-gradient-to-r from-neutral-50 to-white rounded-b-3xl px-8 pb-8 pt-4">
              {activeCommentPostId === post.id ? (
                <CommentSection post={post} addComment={addComment} activeCommentPostId={activeCommentPostId} setActiveCommentPostId={setActiveCommentPostId} />
              ) : (
                <button
                  className="mt-2 px-6 py-2 bg-black text-white rounded-full shadow-md hover:bg-white hover:text-black border border-black transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  onClick={() => setActiveCommentPostId(post.id)}
                >
                  Comment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. CommentSection component
  const CommentSection = ({ post, addComment, activeCommentPostId, setActiveCommentPostId }: { post: BlogPost, addComment: (postId: number, text: string) => void, activeCommentPostId: number | null, setActiveCommentPostId: (id: number | null) => void }) => {
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
    const scrollClass = post.comments.length > 1 ? 'max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : '';
    const inputRef = useRef<HTMLInputElement>(null);
    const replyInputRef = useRef<HTMLInputElement>(null);

    // Focus input if this post is active
    useEffect(() => {
      if (activeCommentPostId === post.id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [activeCommentPostId, post.id]);

    // Focus reply input when replyTo changes
    useEffect(() => {
      if (replyTo && replyInputRef.current) {
        replyInputRef.current.focus();
      }
    }, [replyTo]);

    const addReply = (commentId: number, replyText: string) => {
      setPosts(ps => ps.map(p => {
        if (p.id !== post.id) return p;
        
        return {
          ...p,
          comments: p.comments.map(comment => {
            if (comment.id !== commentId) return comment;
            
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  id: Date.now(),
                  author: 'You',
                  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                  content: replyText,
                  createdAt: new Date().toISOString()
                }
              ]
            };
          })
        };
      }));
      
      setReplyText('');
      setReplyTo(null);
      
      toast({ 
        title: 'Reply posted!', 
        description: 'Your reply has been added.' 
      });
    };

    const toggleLike = (commentId: number) => {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
          toast({ 
            title: 'Unliked!', 
            description: 'Comment unliked.' 
          });
        } else {
          newSet.add(commentId);
          toast({ 
            title: 'Liked!', 
            description: 'Comment liked.' 
          });
        }
        return newSet;
      });
    };

    const CommentThread = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
      const maxDepth = 3; // Maximum nesting depth
      const canReply = depth < maxDepth;
      const isLiked = likedComments.has(comment.id);
      
      return (
        <div className={`${depth > 0 ? 'ml-6 border-l-2 border-neutral-200 pl-4' : ''}`}>
          <div className="flex items-start gap-3 mb-3 group">
            <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full border-2 border-neutral-200" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-black">{comment.author}</span>
                <span className="text-xs text-neutral-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-neutral-700 text-sm leading-relaxed bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                {comment.content}
              </div>
              
              {/* Comment Actions */}
              <div className="flex items-center gap-4 mt-2">
                {canReply && (
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Reply
                  </button>
                )}
                <button 
                  onClick={() => toggleLike(comment.id)}
                  className={`text-xs transition-colors duration-200 font-medium flex items-center gap-1 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-neutral-500 hover:text-red-500'
                  }`}
                >
                  <svg className="w-3 h-3" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
              </div>
              
              {/* Reply Input */}
              {replyTo === comment.id && canReply && (
                <div className="mt-3 bg-white rounded-lg border border-neutral-200 p-3 shadow-sm">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (replyText.trim()) {
                        addReply(comment.id, replyText);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={replyInputRef}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author}...`}
                      className="flex-1 text-sm"
                    />
                    <Button type="submit" size="sm" className="bg-black text-white hover:bg-white hover:text-black border border-black">
                      Reply
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2">
              {comment.replies.map(reply => (
                <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-6 mt-4 border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-neutral-600" />
            <h3 className="font-bold text-lg text-black">Comments ({post.comments.length})</h3>
          </div>
          <button
            onClick={() => setActiveCommentPostId(null)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200 p-1 rounded-full hover:bg-neutral-100"
            title="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`space-y-4 mb-4 ${scrollClass}`}>
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            post.comments.map(comment => (
              <CommentThread key={comment.id} comment={comment} />
            ))
          )}
        </div>
        
        {/* Main Comment Input */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (text.trim()) {
                addComment(post.id, text);
                setText('');
                // Don't close the comment section - keep it open
              }
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button type="submit" className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">
              Post
            </Button>
          </form>
        </div>
      </div>
    );
  };

  // --- Placeholder Components for Other Features ---
  const Placeholder = ({ icon, title, prompt }: { icon: React.ReactNode, title: string, prompt: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center animate-fade-in">
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-black tracking-widest uppercase font-brand">{title}</h2>
      <p className="text-neutral-600 max-w-xl mx-auto text-lg font-brand">{prompt}</p>
      <div className="mt-6 text-neutral-400">(Feature coming soon)</div>
    </div>
  );

  // Profile content components
  const ActivityStatsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Activity Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Posts Created</span>
          <span className="text-2xl font-bold text-black">{profile.stats.postsCreated}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Comments Made</span>
          <span className="text-2xl font-bold text-black">{profile.stats.commentsMade}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Likes Received</span>
          <span className="text-2xl font-bold text-black">{profile.stats.likesReceived}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600 font-medium">Projects Joined</span>
          <span className="text-2xl font-bold text-black">{profile.stats.projectsJoined}</span>
        </div>
      </CardContent>
    </Card>
  );

  const SkillsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Skills & Expertise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map(skill => (
            <Badge key={skill} className="bg-neutral-100 text-neutral-700 font-semibold uppercase tracking-widest">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ContactTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Contact Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.linkedin}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="text-sm text-neutral-700">{profile.github}</span>
        </div>
      </CardContent>
    </Card>
  );

  const AchievementsTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.achievements.map((achievement, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${achievement.color}-100 rounded-full flex items-center justify-center`}>
              {achievement.icon === 'Trophy' && <Trophy className="w-5 h-5 text-yellow-600" />}
              {achievement.icon === 'Users' && <Users className="w-5 h-5 text-blue-600" />}
              {achievement.icon === 'Lightbulb' && <Lightbulb className="w-5 h-5 text-green-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-black">{achievement.title}</p>
              <p className="text-xs text-neutral-500">{achievement.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const PreferencesTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700">Email Notifications</span>
          <Switch 
            checked={profile.preferences.emailNotifications}
            onCheckedChange={(checked) => setProfile(prev => ({ 
              ...prev, 
              preferences: { ...prev.preferences, emailNotifications: checked }
            }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700">Public Profile</span>
          <Switch 
            checked={profile.preferences.publicProfile}
            onCheckedChange={(checked) => setProfile(prev => ({ 
              ...prev, 
              preferences: { ...prev.preferences, publicProfile: checked }
            }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700">Mentor Requests</span>
          <Switch 
            checked={profile.preferences.mentorRequests}
            onCheckedChange={(checked) => setProfile(prev => ({ 
              ...prev, 
              preferences: { ...prev.preferences, mentorRequests: checked }
            }))}
          />
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivityTab = () => (
    <Card className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-black uppercase tracking-wide font-brand">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.recentActivity.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-2 h-2 bg-${activity.type === 'post' ? 'blue' : activity.type === 'join' ? 'green' : 'purple'}-500 rounded-full mt-2`}></div>
            <div>
              <p className="text-sm font-medium text-black">{activity.action}</p>
              <p className="text-xs text-neutral-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // 5. PollDisplay component
  const PollDisplay = ({ post }: { post: BlogPost }) => {
    if (!post.poll) return null;

    const handleVote = (optionIndex: number) => {
      if (post.poll?.votedByUser !== undefined) {
        toast({ title: 'Already voted', description: 'You can only vote once per poll.' });
        return;
      }

      setPosts(prev => prev.map(p => {
        if (p.id === post.id && p.poll) {
          const updatedOptions = [...p.poll.options];
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            votes: updatedOptions[optionIndex].votes + 1,
            votedBy: [...updatedOptions[optionIndex].votedBy, 'You']
          };
          
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              votedByUser: optionIndex
            }
          };
        }
        return p;
      }));
      
      toast({ title: 'Vote recorded!', description: 'Your vote has been counted.' });
    };

    const totalVotes = post.poll.options.reduce((sum, option) => sum + option.votes, 0);
    const hasVoted = post.poll.votedByUser !== undefined;

    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100 shadow-sm">
        {/* Poll Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-800">{post.poll.question}</h3>
        </div>
        
        {/* Poll Options */}
        <div className="space-y-3 mb-4">
          {post.poll?.options.map((option, index) => {
            const totalVotes = post.poll?.options.reduce((sum, opt) => sum + opt.votes, 0) || 0;
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isVoted = post.poll?.votedByUser === index;
            const hasVoted = post.poll?.votedByUser !== undefined;
            
            return (
              <button
                key={option.id}
                onClick={() => {
                  if (!hasVoted) {
                    // Use the same handleVote logic from PollDisplay
                    if (post.poll?.votedByUser !== undefined) {
                      toast({ title: 'Already voted', description: 'You can only vote once per poll.' });
                      return;
                    }

                    setPosts(prev => prev.map(p => {
                      if (p.id === post.id && p.poll) {
                        const updatedOptions = [...p.poll.options];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          votes: updatedOptions[index].votes + 1,
                          votedBy: [...updatedOptions[index].votedBy, 'You']
                        };
                        
                        return {
                          ...p,
                          poll: {
                            ...p.poll,
                            options: updatedOptions,
                            votedByUser: index
                          }
                        };
                      }
                      return p;
                    }));
                    
                    toast({ title: 'Vote recorded!', description: 'Your vote has been counted.' });
                  }
                }}
                disabled={hasVoted}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  hasVoted
                    ? isVoted
                      ? 'border-blue-400 bg-gradient-to-r from-blue-100 to-blue-50'
                      : 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{option.text}</span>
                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm">
                        {percentage}%
                      </span>
                      {isVoted && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                {hasVoted && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
                
                {/* Vote count */}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {option.votes} vote{option.votes !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Poll Footer */}
        {hasVoted && (
          <div className="mt-3 pt-2 border-t border-blue-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total votes: {totalVotes}
              </span>
              <span className="text-blue-600 font-medium">Poll closed</span>
            </div>
          </div>
        )}
        
        {!hasVoted && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Click to vote • {totalVotes} total votes
          </div>
        )}
      </div>
    );
  };

  // 6. MyPollsSection component
  const MyPollsSection = () => {
    return (
      <div className="w-full max-w-6xl mx-auto mt-10 pb-20">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-neutral-600 mb-2">Poll posts are no longer supported</h3>
          <p className="text-neutral-500">You can no longer view or vote on poll posts.</p>
        </div>
      </div>
    );
  };

  // --- X-like New Post dialog state and logic ---
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{ type: 'image' | 'video', file: File, url: string }[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiList = ['😀','😂','😍','😎','😢','😡','👍','🎉','🔥','🙏','🥳','🤔','😇','😅','😜','😱','😏','👏','💯','🚀'];

  // Insert emoji at cursor
  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = newPostText.slice(0, start);
    const after = newPostText.slice(end);
    setNewPostText(before + emoji + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
    setShowEmojiPicker(false);
  };

  // Handle image/video upload
  const handleMediaUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setNewPostMedia(prev => [...prev, { type: 'image', file, url }]);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setNewPostMedia(prev => [...prev, { type: 'video', file, url }]);
      }
    });
  };
  const handlePollOptionChange = (idx: number, value: string) => {
    setPollOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };
  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions(opts => [...opts, '']);
  };
  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(opts => opts.filter((_, i) => i !== idx));
  };
  const handleNewPost = () => {
    if (!newPostText.trim() && newPostMedia.length === 0 && (!showPoll || pollOptions.every(opt => !opt.trim()))) return;
    const newPost: BlogPost = {
      id: Date.now(),
      title: '',
      content: newPostText,
      author: 'You',
      avatar: profile.avatar,
      tags: [],
      createdAt: new Date().toISOString(),
      reactions: { '😊': [], '😢': [], '😡': [], '😮': [], '❤️': [], '🤔': [] },
      bookmarked: false,
      comments: [],
      media: newPostMedia.length > 0 ? newPostMedia : undefined,
      poll: showPoll ? {
        question: newPostText,
        options: pollOptions.filter(opt => opt.trim()).map((opt, i) => ({ id: i + 1, text: opt, votes: 0, votedBy: [] })),
        votedByUser: undefined
      } : undefined
    };
    setPosts(prev => [newPost, ...prev]);
    setShowNewPostDialog(false);
    setNewPostText('');
    setNewPostMedia([]);
    setShowPoll(false);
    setPollOptions(['', '']);
    toast({ title: 'Posted!', description: 'Your post has been published.' });
  };

  // --- X-like New Post dialog UI ---
  const newPostDialog = (
    <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
      <DialogContent className="max-w-xl min-w-[420px] min-h-[380px] w-full rounded-2xl shadow-2xl border border-neutral-800 bg-black text-white p-0 overflow-visible animate-fade-in" style={{ padding: 0 }}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-3">
            <span className="font-bold text-2xl">Create Post</span>
            <button className="text-neutral-400 hover:text-white text-lg font-semibold" onClick={() => setShowNewPostDialog(false)}>Cancel</button>
          </div>
          {/* Main */}
          <div className="flex px-8 pb-8 gap-6">
            <img src={profile.avatar} alt="avatar" className="w-14 h-14 rounded-full border-2 border-neutral-700 mt-1" />
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                className="w-full min-h-[80px] max-h-72 resize-none bg-black text-white text-xl placeholder-neutral-400 focus:outline-none border-b border-neutral-700 mb-2"
                placeholder="What's happening?"
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                rows={3}
                style={{ fontFamily: 'inherit' }}
              />
              {/* YouTube video preview */}
              {(() => {
                const videoId = extractYouTubeVideoId(newPostText);
                if (videoId) {
                  return (
                    <div className="my-4 flex flex-col items-center">
                      <div className="w-full max-w-md aspect-video rounded-xl overflow-hidden border-2 border-neutral-700 shadow-lg">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {/* Media preview (images/videos) */}
              {newPostMedia.length > 0 && (
                <div className="flex gap-4 mt-4 flex-wrap">
                  {newPostMedia.map((media, idx) => (
                    <div key={idx} className="relative group">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="preview" className="w-28 h-28 object-cover rounded-xl border-2 border-neutral-700" />
                      ) : (
                        <video src={media.url} className="w-28 h-28 object-cover rounded-xl border-2 border-neutral-700" controls />
                      )}
                      <button onClick={() => setNewPostMedia(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1 shadow hover:bg-red-600 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              )}
              {/* Poll options */}
              {showPoll && (
                <div className="mt-5 space-y-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={e => handlePollOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 text-black bg-white border border-neutral-700 text-base px-4 py-2 rounded-lg"
                        maxLength={60}
                      />
                      {pollOptions.length > 2 && (
                        <button onClick={() => removePollOption(idx)} className="text-neutral-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button onClick={addPollOption} className="text-sm text-blue-400 hover:underline mt-1">Add option</button>
                  )}
                </div>
              )}
              {/* Actions row */}
              <div className="flex items-center gap-5 mt-6 relative">
                <button
                  type="button"
                  className="p-3 rounded-full hover:bg-neutral-900"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add image or video"
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleMediaUpload(e.target.files)}
                />
                <button
                  type="button"
                  className={`p-3 rounded-full hover:bg-neutral-900 ${showPoll ? 'bg-neutral-800' : ''}`}
                  onClick={() => setShowPoll(v => !v)}
                  title="Add poll"
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </button>
                {/* Emoji picker functional */}
                <div className="relative">
                  <button type="button" className="p-3 rounded-full hover:bg-neutral-900" title="Add emoji" onClick={() => setShowEmojiPicker(v => !v)}>
                    <Smile className="w-6 h-6 text-yellow-400" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-12 z-50 bg-white text-black rounded-xl shadow-xl p-2 flex flex-wrap gap-1 w-64">
                      {emojiList.map(emoji => (
                        <button key={emoji} className="text-2xl p-1 hover:bg-neutral-200 rounded" onClick={() => insertEmoji(emoji)}>{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1" />
                <Button
                  className="rounded-full px-10 py-3 font-bold text-black bg-white hover:bg-neutral-200 text-lg disabled:opacity-60"
                  disabled={(!newPostText.trim() && newPostMedia.length === 0 && (!showPoll || pollOptions.every(opt => !opt.trim())))}
                  onClick={handleNewPost}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Utility function to extract YouTube video ID from a string
  function extractYouTubeVideoId(text: string): string | null {
    // Regex for various YouTube URL formats
    const regex = /(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/))([\w-]{11})/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  // Only one video can play at a time across all posts
  // Store { postId, videoId } of the currently playing video
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{ postId: number; videoId: string } | null>(null);

  // Add at the top of the BridgeLab component:
  const playerRefs = useRef<{ [key: string]: unknown }>({});
  const [videoVolumes, setVideoVolumes] = useState<{ [key: string]: number }>({});

  // Add useEffect to load the YouTube IFrame API and manage player refs:
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  useEffect(() => {
    if (!currentlyPlaying) return;
    const { postId, videoId } = currentlyPlaying;
    const playerId = `ytplayer_${postId}_${videoId}`;
    const winYT = (window as unknown as { YT?: { Player: unknown } }).YT;
    if (!winYT || !winYT.Player) return;
    const playerElem = document.getElementById(playerId);
    if (!playerElem) return;
    playerRefs.current[`${postId}_${videoId}`] = new (winYT.Player as new (...args: unknown[]) => unknown)(playerElem, {
      videoId,
      events: {
        onReady: event => {
          event.target.setVolume(videoVolumes[`${postId}_${videoId}`] ?? 100);
        }
      },
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0
      }
    });
    return () => {
      if (playerRefs.current[`${postId}_${videoId}`]) {
        const player = playerRefs.current[`${postId}_${videoId}`];
        if (player && typeof (player as { destroy?: () => void }).destroy === 'function') {
          (player as { destroy?: () => void }).destroy?.();
        }
        playerRefs.current[`${postId}_${videoId}`] = null;
      }
    };
  }, [currentlyPlaying, videoVolumes]);

  // Conference Chat state
  const [showConference, setShowConference] = useState(false);
  const [inConference, setInConference] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center animate-fade-in font-sans relative" style={{ fontFamily: 'Space Grotesk, Inter, Helvetica Neue, Arial, sans-serif' }}>
      {/* Faint background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1.5px)', backgroundSize: '32px 32px', opacity: 0.18 }} />
      {/* Fixed Logo at top left */}
      <div className="fixed top-6 left-6 z-50 flex flex-col items-center">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white shadow-xl hover:from-yellow-600 hover:to-orange-500 transition-all duration-300 rounded-full p-1 flex items-center justify-center h-28 w-28">
          <img src={BridgeLabLogo} alt="BridgeLab Logo" className="h-24 w-24 object-contain" />
        </div>
      </div>
      <div className="w-full max-w-7xl z-10" style={{ marginLeft: '9rem' }}>
        {/* Top left: Heading, Back Button and Top right: Search */}
        <div className="flex items-center justify-between gap-4 pt-8 pb-4 pl-4 pr-4">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="rounded-full p-2 mr-2" aria-label="Back to Classroom" onClick={() => navigate('/classroom')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            {/* Accelerator Button Only */}
            {!(tab === 'profile' || tab === 'circles' || tab === 'pitch' || tab === 'post') ? (
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-purple-700 border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-200 shadow-sm"
                onClick={() => navigate('/acceleratorlibrary')}
                aria-label="Go to Accelerator of Ideas"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Accelerator
              </Button>
            ) : null}
          </div>
          {!(tab === 'profile' || tab === 'circles' || tab === 'pitch' || tab === 'post') && (
            <div className="flex items-center gap-2">
              <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                aria-label="Open Shorts"
                onClick={() => navigate('/shorts')}
              >
                <Video className="w-7 h-7" />
              </Button>
            </div>
          )}
        </div>
        
       
        
        {/* Divider */}
        <div className="w-full border-t border-neutral-200 mb-8" />
        
        {/* Content Areas */}
        <div className="w-full">
          {tab === 'discover' && <div className="pb-20">{DiscoverBlogFeed()}</div>}
          {tab === 'my-polls' && (
            <div className="pb-20">
              <MyPollsSection />
            </div>
          )}
          {tab === 'teammatch' && (
            <div className="pb-20">
              <div className="w-full max-w-6xl mx-auto mt-10">
                {/* TeamMatch Section Heading */}
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Find a Teammate</h1>
                {/* Toggle Advanced Filters Button */}
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-purple-700 border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-200 shadow-sm"
                    onClick={() => setShowAdvancedFilters(v => !v)}
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                  </Button>
                </div>
                {/* Filters */}
                {showAdvancedFilters && (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border-0 animate-fade-in mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Filter className="w-5 h-5 text-black" />
                      <h2 className="text-xl font-bold text-black uppercase tracking-wide font-brand">Advanced Filters</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Search */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <Input 
                            placeholder="Search by name or bio..."
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                            className="w-full pl-10 bg-neutral-50 border-neutral-200 focus:border-black focus:ring-black"
                          />
                        </div>
                      </div>

                      {/* Year Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Year</label>
                        <select 
                          value={teamYearFilter}
                          onChange={(e) => setTeamYearFilter(e.target.value)}
                          className="w-full border-neutral-200 focus:border-black focus:ring-black rounded-lg bg-neutral-50 px-4 py-3 text-sm"
                        >
                          <option value="">All Years</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    {/* Skills Filter */}
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Skills</label>
                      
                      {/* Selected Skills */}
                      {teamSkillFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teamSkillFilter.map(skill => (
                            <Badge key={skill} className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2">
                              {skill}
                              <button
                                onClick={() => removeSkillFromFilter(skill)}
                                className="hover:text-red-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Skills Dropdown */}
                      <div className="skill-dropdown-container relative">
                        <div className="relative">
                          <Input
                            placeholder="Search and select skills..."
                            value={skillSearch}
                            onChange={(e) => {
                              setSkillSearch(e.target.value);
                              openSkillDropdown();
                            }}
                            onFocus={openSkillDropdown}
                            className="w-full bg-neutral-50 border-neutral-200 focus:border-black focus:ring-black pr-10"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                        
                        {showSkillDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-3 border-b border-neutral-100">
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                Available Skills ({filteredSkills.length})
                              </p>
                            </div>
                            {filteredSkills.length > 0 ? (
                              <div className="py-1">
                                {filteredSkills.slice(0, 15).map(skill => (
                                  <button
                                    key={skill}
                                    onClick={() => addSkillToFilter(skill)}
                                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium transition-colors flex items-center gap-3"
                                  >
                                    <Plus className="w-4 h-4 text-neutral-400" />
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-neutral-500 text-sm">
                                No skills found matching "{skillSearch}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Department Filter */}
                    <div className="mt-6 space-y-3">
                      <label className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Departments</label>
                      
                      {/* Selected Departments */}
                      {teamDeptFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teamDeptFilter.map(dept => (
                            <Badge key={dept} className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2">
                              {dept}
                              <button
                                onClick={() => toggleDepartment(dept)}
                                className="hover:text-red-200 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Department Dropdown */}
                      <div className="dept-dropdown-container relative">
                        <button
                          onClick={openDeptDropdown}
                          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg hover:border-black hover:bg-neutral-100 transition-all duration-200 text-left cursor-pointer"
                        >
                          <span className={teamDeptFilter.length > 0 ? "text-black font-medium" : "text-neutral-500"}>
                            {teamDeptFilter.length > 0 
                              ? `${teamDeptFilter.length} department${teamDeptFilter.length > 1 ? 's' : ''} selected`
                              : "Select departments..."
                            }
                          </span>
                          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showDeptDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showDeptDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-3 border-b border-neutral-100">
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                All Departments ({allDepartments.length})
                              </p>
                            </div>
                            <div className="py-1">
                              {allDepartments.map(dept => (
                                <button
                                  key={dept}
                                  onClick={() => toggleDepartment(dept)}
                                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium transition-colors flex items-center gap-3"
                                >
                                  {teamDeptFilter.includes(dept) ? (
                                    <Check className="w-4 h-4 text-black" />
                                  ) : (
                                    <div className="w-4 h-4 border border-neutral-300 rounded" />
                                  )}
                                  {dept}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(teamSkillFilter.length > 0 || teamDeptFilter.length > 0 || teamYearFilter !== '') && (
                      <div className="mt-6 pt-4 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            setTeamSkillFilter([]);
                            setTeamDeptFilter([]);
                            setTeamYearFilter('');
                          }}
                          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors font-medium"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeamMembers.map(member => (
                    <Card key={member.id} className="bg-white rounded-2xl shadow-xl border-0 p-6 animate-fade-in hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full" />
                          <div>
                            <CardTitle className="text-xl font-bold text-black font-brand">{member.name}</CardTitle>
                            <p className="text-neutral-600 text-sm">{member.department} • {member.year}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700 text-sm mb-4">{member.bio}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {member.skills.map(skill => (
                            <Badge key={skill} className="bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-widest">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button className="bg-black text-white rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest flex-1">Connect</Button>
                          <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest">View Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTeamMembers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-600 mb-2">No matches found</h3>
                    <p className="text-neutral-500">Try adjusting your filters to find more team members.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === 'circles' && (
            <div className="pb-20">
              {/* --- Circles Chat UI --- */}
              <div className="w-full max-w-6xl mx-auto mt-10 flex gap-8 animate-fade-in">
                {/* Sidebar: Chat Rooms */}
                <div className="w-80 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl border-0 p-6 flex flex-col gap-4 h-[600px] min-h-[400px] max-h-[80vh] overflow-y-auto relative">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-black uppercase tracking-wide font-brand">Warroom</h2>
                    <Button size="icon" variant="ghost" className="rounded-full p-2" title="New Room (coming soon)"><Plus className="w-5 h-5 text-purple-500" /></Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {chatRooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoom(room.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-semibold text-base border-2 ${activeRoom === room.id ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-400 shadow-lg scale-105' : 'bg-white text-neutral-700 border-transparent hover:border-purple-200 hover:bg-purple-50 hover:scale-105'}`}
                        style={{ boxShadow: activeRoom === room.id ? '0 4px 24px 0 rgba(80, 80, 200, 0.10)' : undefined }}
                      >
                        <img src={room.avatar} alt={room.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{room.name}</div>
                          <div className="text-xs text-neutral-400 truncate">{room.type === 'group' ? 'Group' : room.type === 'mentor' ? 'Mentor' : 'Direct'}</div>
                        </div>
                        {room.unread > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{room.unread}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Chat Window */}
                <div className="flex-1 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border-0 p-0 flex flex-col h-[600px] min-h-[400px] max-h-[80vh] overflow-hidden">
                  {activeRoomObj ? (
                    <>
                      {/* Chat Header */}
                      <div className="flex items-center gap-4 px-8 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-2xl shadow-sm">
                        <img src={activeRoomObj.avatar} alt={activeRoomObj.name} className="w-12 h-12 rounded-full border-2 border-white shadow" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-black truncate">{activeRoomObj.name}</div>
                          <div className="text-xs text-purple-600 font-semibold">{activeRoomObj.type === 'group' ? 'Group Discussion' : activeRoomObj.type === 'mentor' ? 'Mentorship' : 'Direct Message'}</div>
                        </div>
                        <span className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg" title="Online"></span>
                        <Button size="sm" variant="outline" className="ml-4 bg-gradient-to-r from-blue-200 to-purple-200 text-purple-800 font-bold shadow" onClick={() => setShowConference(true)}>
                          <Users className="w-4 h-4 mr-2" /> Start Conference
                        </Button>
                      </div>
                      {/* Conference Modal */}
                      <ConferenceDialog open={showConference} onOpenChange={setShowConference}>
                        <ConferenceDialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
                          <ConferenceDialogHeader className="bg-gradient-to-r from-blue-100 to-purple-100 px-8 py-4 border-b border-blue-200">
                            <ConferenceDialogTitle className="text-xl font-bold text-black flex items-center gap-2">
                              <Users className="w-6 h-6 text-purple-600" /> Conference Chat
                            </ConferenceDialogTitle>
                          </ConferenceDialogHeader>
                          <div className="p-8 flex flex-col gap-6">
                            <div className="flex gap-4 items-center mb-4">
                              <img src={activeRoomObj.avatar} alt="Host" className="w-14 h-14 rounded-full border-2 border-purple-400 shadow" />
                              <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="You" className="w-14 h-14 rounded-full border-2 border-blue-400 shadow" />
                              <span className="text-lg font-semibold text-purple-700">{activeRoomObj.name} & You</span>
                            </div>
                            <div className="flex gap-4">
                              <Button onClick={() => setInConference(v => !v)} className={inConference ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                                {inConference ? 'Leave Conference' : 'Join Conference'}
                              </Button>
                              <Button variant="outline" onClick={() => setShowConference(false)}>Close</Button>
                            </div>
                            <div className="bg-white rounded-xl border border-blue-100 shadow-inner p-6 mt-4 min-h-[120px] flex flex-col gap-2">
                              <div className="text-sm text-neutral-500 mb-2">Conference chat area (simulated)</div>
                              <div className="flex-1 text-neutral-700">{inConference ? 'You are in the conference. (Voice/Video not implemented)' : 'Join to participate in the conference.'}</div>
                            </div>
                          </div>
                        </ConferenceDialogContent>
                      </ConferenceDialog>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-3" style={{ maxHeight: '380px' }}>
                        {activeRoomMessages.map(msg => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}> 
                            {msg.sender !== 'You' && (
                              <img src={activeRoomObj.avatar} alt={msg.sender} className="w-8 h-8 rounded-full border-2 border-white shadow" />
                            )}
                            <div className={`max-w-xs px-5 py-3 rounded-2xl shadow-md text-base ${msg.sender === 'You' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-sm' : 'bg-white text-black border border-blue-100 rounded-bl-sm'}`} style={{ wordBreak: 'break-word' }}>
                              <div className="text-xs font-bold mb-1 opacity-70">{msg.sender}</div>
                              <div className="text-sm">{msg.text}</div>
                              <div className="text-[10px] text-neutral-400 mt-1 text-right">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            {msg.sender === 'You' && (
                              <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="You" className="w-8 h-8 rounded-full border-2 border-white shadow" />
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 px-8 py-5 bg-white/80 backdrop-blur-md border-t border-blue-100 rounded-b-2xl shadow-inner sticky bottom-0 z-10">
                        <Button type="button" size="icon" variant="ghost" className="rounded-full"><Smile className="w-6 h-6 text-purple-400" /></Button>
                        <Button type="button" size="icon" variant="ghost" className="rounded-full"><Upload className="w-6 h-6 text-blue-400" /></Button>
                        <Input
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 rounded-full bg-white border border-blue-100 px-5 py-3 text-base shadow-sm focus:border-purple-400 focus:ring-purple-400"
                        />
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">Send</Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-neutral-400 text-lg">Select a chat to start messaging.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === 'pitch' && (
            <div className="pb-20">
              <Placeholder icon={<BookOpen className="w-16 h-16 text-neutral-300" strokeWidth={1.5} />} title="Pitch & Demo Board" prompt="Show what you're building. Post updates, get feedback, and prepare for Demo Day." />
            </div>
          )}
          {tab === 'mentor' && (
            <div className="pb-20">
              <Placeholder icon={<UserCheck className="w-16 h-16 text-neutral-300" strokeWidth={1.5} />} title="MentorConnect" prompt="Get guidance from alumni, professors, or startup founders. Request quick advice or long-term mentorship." />
            </div>
          )}
          {tab === 'profile' && (
            <div className="pb-20">
              <div className="w-full max-w-6xl mx-auto mt-10">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-0 animate-fade-in mb-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-xl" />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-extrabold text-black tracking-tight uppercase font-brand">{profile.name}</h1>
                      <p className="text-neutral-600 text-lg font-brand">{profile.department} • {profile.year}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-black text-white font-bold">Active</Badge>
                        <span className="text-sm text-neutral-500">Member since 2022</span>
                      </div>
                    </div>
                    <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                      <DialogTrigger asChild>
                        <Button className="bg-black text-white rounded-full px-6 py-2 font-bold uppercase tracking-widest">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-black uppercase tracking-wide font-brand">Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          {/* Basic Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-black uppercase tracking-wide">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-neutral-700">Name</label>
                                <Input 
                                  value={editProfile.name} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700">Department</label>
                                <Input 
                                  value={editProfile.department} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, department: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700">Year</label>
                                <Input 
                                  value={editProfile.year} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, year: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700">Avatar URL</label>
                                <Input 
                                  value={editProfile.avatar} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, avatar: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-black uppercase tracking-wide">Contact Information</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-neutral-700">Email</label>
                                <Input 
                                  value={editProfile.email} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700">LinkedIn</label>
                                <Input 
                                  value={editProfile.linkedin} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700">GitHub</label>
                                <Input 
                                  value={editProfile.github} 
                                  onChange={(e) => setEditProfile(prev => ({ ...prev, github: e.target.value }))}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-black uppercase tracking-wide">Skills & Expertise</h3>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="Add a skill..."
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addSkill((e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button onClick={() => {
                                  const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                                  if (input) {
                                    addSkill(input.value);
                                    input.value = '';
                                  }
                                }}>Add</Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {editProfile.skills.map(skill => (
                                  <Badge key={skill} className="bg-neutral-100 text-neutral-700 font-semibold uppercase tracking-widest">
                                    {skill}
                                    <button 
                                      onClick={() => removeSkill(skill)}
                                      className="ml-2 text-neutral-500 hover:text-neutral-700"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                          <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
                          <Button onClick={saveProfile} className="bg-black text-white">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Profile Tabs */}
                <Tabs value={profileTab} onValueChange={setProfileTab} className="w-full">
                  <TabsList
                    className="flex flex-row gap-0 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-2xl w-full justify-between px-2 py-2 mb-0 mt-0 transition-all duration-300"
                    style={{ minHeight: '3.5rem' }}
                  >
                    {profileTabItems.map(({ value, label, icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={`mx-1 group relative flex flex-col items-center justify-center px-4 py-2 rounded-lg font-brand text-sm font-semibold transition-all duration-200 flex-1 max-w-[90px] cursor-pointer
                          hover:scale-105 hover:bg-neutral-200 hover:shadow
                          ${profileTab === value
                            ? 'text-blue-700 bg-gradient-to-r from-blue-100 via-pink-100 to-blue-50 shadow-xl border-2 border-blue-400 scale-105 z-10 font-bold'
                            : 'text-neutral-500 hover:text-blue-600'
                          }
                        `}
                        style={{ minWidth: 0 }}
                      >
                        <span className="flex items-center justify-center w-full mb-1">
                          {React.cloneElement(icon, {
                            className: `w-6 h-6 transition-all duration-200 ${profileTab === value ? 'text-blue-600 drop-shadow-tabicon' : 'text-neutral-400 group-hover:text-blue-500'}`
                          })}
                        </span>
                        <span className="text-center transition-all duration-200 leading-tight">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="w-full">
                    <TabsContent value="activity">{ActivityStatsTab()}</TabsContent>
                    <TabsContent value="skills">{SkillsTab()}</TabsContent>
                    <TabsContent value="contact">{ContactTab()}</TabsContent>
                    <TabsContent value="achievements">{AchievementsTab()}</TabsContent>
                    <TabsContent value="preferences">{PreferencesTab()}</TabsContent>
                    <TabsContent value="recent">{RecentActivityTab()}</TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Navigation Tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto px-4">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList
                className="flex flex-row gap-0 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-2xl w-full justify-between px-2 py-2 mb-0 mt-0 transition-all duration-300"
                style={{ minHeight: '3.5rem' }}
              >
                {tabItems.map(({ value, label, icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`mx-1 group relative flex flex-col items-center justify-center px-3 py-2 rounded-lg font-brand text-xs font-semibold transition-all duration-200 flex-1 max-w-[120px] cursor-pointer
                      hover:scale-105 hover:bg-neutral-200 hover:shadow
                      ${tab === value
                        ? 'text-blue-700 bg-gradient-to-r from-blue-100 via-pink-100 to-blue-50 shadow-xl border-2 border-blue-400 scale-105 z-10 font-bold'
                        : 'text-neutral-500 hover:text-blue-600'
                      }
                    `}
                    style={{ minWidth: 0 }}
                  >
                    <span className="flex items-center justify-center w-full mb-1">
                      {React.cloneElement(icon, {
                        className: `w-5 h-5 transition-all duration-200 ${tab === value ? 'text-blue-600 drop-shadow-tabicon' : 'text-neutral-400 group-hover:text-blue-500'}`
                      })}
                    </span>
                    <span className="text-center transition-all duration-200 leading-tight">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      {newPostDialog}
    </div>
  );
};

export default BridgeLab; 