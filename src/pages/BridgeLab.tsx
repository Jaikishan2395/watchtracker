import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Upload, Users, Lightbulb, BookOpen, Trophy, ShieldCheck, UserCheck, MessageCircle, FileText, UserCircle, ArrowLeft, User, Globe, Code, Award, Settings, Clock, Filter, Search, ChevronDown, Plus, X, Check, RotateCcw } from 'lucide-react';
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

// 1. BlogPost and Comment types
interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}
interface BlogPost {
  id: number;
  title: string;
  content: string; // HTML string for rich text
  author: string;
  avatar: string;
  tags: string[];
  createdAt: string;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  comments: Comment[];
  media?: { type: 'image' | 'video', file: File, url: string }[];
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
    likes: 12,
    liked: false,
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
  },
  {
    id: 2,
    title: 'Why Eco Startups Matter',
    content: '<p>Let\'s talk about <i>sustainability</i> and eco-friendly startups. 🌱</p>',
    author: 'Bob',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    tags: ['Eco', 'Startup'],
    createdAt: '2024-06-02T09:00:00Z',
    likes: 7,
    liked: true,
    bookmarked: true,
    comments: [],
  },
];

const branchOptions = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Other'];

const tabItems = [
  { value: 'discover', label: 'Discover', icon: <Lightbulb className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'post', label: 'New Post', icon: <Upload className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'teammatch', label: 'TeamMatch', icon: <Users className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'circles', label: 'Circles', icon: <MessageCircle className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'pitch', label: 'Pitch', icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'mentor', label: 'Mentor', icon: <UserCheck className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'profile', label: 'Profile', icon: <User className="w-6 h-6" strokeWidth={1.5} /> },
];

const BridgeLab: React.FC = () => {
  const [tab, setTab] = useState('discover');
  const [posts, setPosts] = useState<BlogPost[]>(dummyPosts);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const postsPerPage = 5;
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
  const paginated = filtered.slice((page-1)*postsPerPage, page*postsPerPage);

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
  const toggleLike = (id: number) => setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes-1 : p.likes+1 } : p));
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

  const removeMedia = (index: number) => {
    setNewMedia(prev => {
      const newMedia = [...prev];
      URL.revokeObjectURL(newMedia[index].url);
      newMedia.splice(index, 1);
      return newMedia;
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

  // --- Chat mock data and logic (correct placement) ---
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

  // 3. DiscoverBlogFeed component
  const DiscoverBlogFeed = () => (
    <div className="w-full max-w-3xl mx-auto mt-10">
      {/* Blog Feed */}
      <div className="flex flex-col gap-12">
        {paginated.map(post => (
          <div
            key={post.id}
            className="discover-post-card bg-white rounded-3xl shadow-2xl p-0 border border-neutral-200 hover:shadow-3xl transition-all duration-300 group overflow-hidden relative"
            style={{ minHeight: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 px-8 pt-8 pb-2">
              <img src={post.avatar} alt={post.author} className="w-14 h-14 rounded-full border-2 border-blue-200 shadow group-hover:scale-105 transition-transform duration-200" />
              <div>
                <span className="font-bold text-xl cursor-pointer hover:underline text-black" onClick={() => navigate(`/profile?user=${encodeURIComponent(post.author)}`)}>{post.author}</span>
                <span className="ml-2 text-xs text-neutral-400">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {/* Title */}
            <h2 className="text-3xl font-extrabold mb-2 px-8 text-black tracking-wide font-brand uppercase mt-2">{post.title}</h2>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 px-8 mb-2">
              {post.tags && post.tags.map(tag => (
                <Badge key={tag} className="bg-blue-100 text-blue-700 font-semibold uppercase tracking-widest px-3 py-1 text-xs rounded-full shadow-sm">{tag}</Badge>
              ))}
            </div>
            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 mb-4">
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
            {/* Content */}
            <div className="prose max-w-none mb-4 px-8 text-lg text-neutral-800" dangerouslySetInnerHTML={{ __html: post.content }} />
            {/* Divider */}
            <div className="w-full border-t border-neutral-200 my-4" />
            {/* Actions */}
            <div className="flex items-center gap-8 px-8 pb-6">
              <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-2 text-lg font-bold transition-all ${post.liked ? 'text-blue-600' : 'text-neutral-400 hover:text-blue-600'}`}>
                {post.liked ? '♥' : '♡'} <span>{post.likes}</span>
              </button>
              <button onClick={() => toggleBookmark(post.id)} className={`flex items-center gap-2 text-lg font-bold transition-all ${post.bookmarked ? 'text-yellow-500' : 'text-neutral-400 hover:text-yellow-500'}`}>
                {post.bookmarked ? '★' : '☆'}
              </button>
              <span className="text-neutral-400 text-base">{post.comments.length} comments</span>
            </div>
            {/* Comments */}
            <div className="bg-neutral-50 rounded-b-3xl px-8 pb-8 pt-4">
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
      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-10">
        <Button disabled={page === 1} onClick={() => setPage(p => p-1)} className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">Prev</Button>
        <span className="text-neutral-500">Page {page}</span>
        <Button disabled={page*postsPerPage >= filtered.length} onClick={() => setPage(p => p+1)} className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">Next</Button>
      </div>
    </div>
  );

  // 4. CommentSection component
  const CommentSection = ({ post, addComment, activeCommentPostId, setActiveCommentPostId }: { post: BlogPost, addComment: (postId: number, text: string) => void, activeCommentPostId: number | null, setActiveCommentPostId: (id: number | null) => void }) => {
    const [text, setText] = useState('');
    const scrollClass = post.comments.length > 1 ? 'max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50' : '';
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input if this post is active
    useEffect(() => {
      if (activeCommentPostId === post.id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [activeCommentPostId, post.id]);

    return (
      <div className="bg-neutral-50 rounded-xl p-4 mt-2">
        <div className={`flex flex-col gap-2 mb-2 ${scrollClass}`} style={{ minHeight: 0 }}>
          {post.comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3 mb-2">
              <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full" />
              <div>
                <span className="font-bold text-sm">{comment.author}</span>
                <span className="ml-2 text-xs text-neutral-400">{new Date(comment.createdAt).toLocaleString()}</span>
                <div className="text-neutral-700 text-sm mt-1">{comment.content}</div>
                {/* Replies (1-level only for now) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 mt-2 border-l-2 border-neutral-200 pl-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="flex items-start gap-2 mb-1">
                        <img src={reply.avatar} alt={reply.author} className="w-7 h-7 rounded-full" />
                        <div>
                          <span className="font-bold text-xs">{reply.author}</span>
                          <span className="ml-2 text-xs text-neutral-400">{new Date(reply.createdAt).toLocaleString()}</span>
                          <div className="text-neutral-700 text-xs mt-0.5">{reply.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (text.trim()) { addComment(post.id, text); setText(''); }
          }}
          className="flex gap-2 mt-2"
        >
          <Input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button type="submit" className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">Post</Button>
        </form>
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

  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageEditorSrc, setImageEditorSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Helper for tag validation
  const parseTags = (tags: string) => tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5);

  // Add state to track the active comment input post
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);

  // Add effect to close comment input when clicking outside any post
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If the click is outside any .discover-post-card, close all comment inputs
      if (!(e.target as Element).closest('.discover-post-card')) {
        setActiveCommentPostId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
            {/* Logo removed from here, now fixed at top left */}
          </div>
          {!(tab === 'profile' || tab === 'circles' || tab === 'pitch' || tab === 'post') && (
            <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
          )}
        </div>
        {/* Divider */}
        <div className="w-full border-t border-neutral-200 mb-8" />
        
        {/* Content Areas */}
        <div className="w-full">
          {tab === 'discover' && <div className="pb-20">{DiscoverBlogFeed()}</div>}
          {tab === 'post' && (
            <div className="pb-20">
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12 mt-10 flex flex-col gap-8 border-0 animate-fade-in">
                {/* Preview Card */}
                {showPreview && (
                  <div className="mb-8">
                    <Card className="mb-4">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="You" className="w-10 h-10 rounded-full" />
                        <div>
                          <CardTitle className="text-lg font-bold">{newTitle}</CardTitle>
                          <CardDescription className="text-xs text-neutral-400">Now</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none mb-2" dangerouslySetInnerHTML={{ __html: newContent }} />
                        <div className="flex flex-wrap gap-2 mb-2">
                          {parseTags(newTags).map(tag => (
                            <Badge key={tag} className="bg-neutral-100 text-neutral-700 font-semibold uppercase tracking-widest">{tag}</Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {newMedia.map((media, idx) => (
                            <div key={idx} className="relative">
                              {media.type === 'image' ? (
                                <img src={media.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                              ) : (
                                <video src={media.url} className="w-full h-32 object-cover rounded-lg" controls />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setShowPreview(false)}>Edit</Button>
                      <Button className="bg-black text-white" onClick={() => setShowConfirm(true)}>Publish</Button>
                    </div>
                  </div>
                )}
                {/* New Post Form */}
                {!showPreview && (
                  <form onSubmit={e => {
                    e.preventDefault();
                    if (!newContent) {
                      toast({ title: 'Content is required', description: '', });
                      return;
                    }
                    const tagsArr = parseTags(newTags);
                    if (tagsArr.length > 5) {
                      toast({ title: 'Maximum 5 tags allowed', description: '', });
                      return;
                    }
                    setShowPreview(true);
                  }}>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title (optional)" className="w-full mb-4 px-4 py-2 rounded-lg border-0 bg-neutral-100 text-lg font-bold" />
                    <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags (comma separated, max 5)" className="w-full mb-4 px-4 py-2 rounded-lg border-0 bg-neutral-100 text-base" />
                  {/* Media Upload Section */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">Add Media (Images/Videos)</label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver ? 'border-blue-400 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                      <p className="text-sm text-neutral-600 mb-2">Drag & drop images or videos here, or</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files) handleFileUpload(e.target.files);
                          }}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="bg-black text-white px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-neutral-800 transition-colors">
                        Choose Files
                      </label>
                    </div>
                  </div>

                    {/* Media Preview with Edit Button */}
                  {newMedia.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Media Preview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {newMedia.map((media, index) => (
                          <div key={index} className="relative group">
                            {media.type === 'image' ? (
                                <>
                              <img src={media.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingImageIndex(index);
                                      setImageEditorSrc(media.url);
                                    }}
                                    className="absolute top-2 right-8 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-blue-600 transition-colors z-10"
                                    title="Edit Image"
                                  >
                                    ✎
                                  </button>
                                </>
                            ) : (
                              <video src={media.url} className="w-full h-32 object-cover rounded-lg" controls />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                    {/* Image Editor Modal */}
                    {imageEditorSrc && editingImageIndex !== null && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl p-6 shadow-2xl relative">
                          <ImageEditor
                            image={imageEditorSrc}
                            onSave={(editedDataUrl) => {
                              setNewMedia(prev => prev.map((m, i) => i === editingImageIndex ? { ...m, url: editedDataUrl } : m));
                              setImageEditorSrc(null);
                              setEditingImageIndex(null);
                            }}
                            onCancel={() => {
                              setImageEditorSrc(null);
                              setEditingImageIndex(null);
                            }}
                          />
                        </div>
                      </div>
                    )}

                  <div data-color-mode="light">
                    <MDEditor value={newContent} onChange={setNewContent} height={300} />
                  </div>
                  <div className="mt-4">
                    <span className="font-bold text-neutral-700">Preview:</span>
                    <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                      <MarkdownPreview source={newContent || ''} />
                    </div>
                  </div>
                    <Button type="submit" className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black" disabled={loading}>{loading ? 'Loading...' : 'Preview & Publish'}</Button>
                </form>
                )}
                {/* Confirm Dialog */}
                <ConfirmDialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <ConfirmDialogContent>
                    <ConfirmDialogHeader>
                      <ConfirmDialogTitle>Are you sure you want to publish this post?</ConfirmDialogTitle>
                    </ConfirmDialogHeader>
                    <div className="flex gap-4 mt-6 justify-end">
                      <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                      <Button className="bg-black text-white" onClick={async () => {
                        setLoading(true);
                        try {
                          setPosts(prev => [{
                            id: Date.now(),
                            title: newTitle,
                            content: newContent,
                            author: 'You',
                            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                            tags: parseTags(newTags),
                            createdAt: new Date().toISOString(),
                            likes: 0,
                            liked: false,
                            bookmarked: false,
                            comments: [],
                            media: newMedia
                          }, ...prev]);
                          setShowPreview(false);
                          setShowConfirm(false);
                          setNewTitle('');
                          setNewContent('');
                          setNewTags('');
                          setNewMedia([]);
                          toast({ title: 'Post published!', description: 'Your post is now live.' });
                          setTab('discover');
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 300);
                        } catch (err) {
                          toast({ title: 'Error publishing post', description: String(err) });
                        } finally {
                          setLoading(false);
                        }
                      }}>Publish</Button>
                    </div>
                  </ConfirmDialogContent>
                </ConfirmDialog>
              </div>
            </div>
          )}
          {tab === 'teammatch' && (
            <div className="pb-20">
              <div className="w-full max-w-6xl mx-auto mt-10">
                

                {/* Filters */}
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
                <div className="w-80 bg-white rounded-2xl shadow-xl border-0 p-6 flex flex-col gap-4 h-[600px] min-h-[400px] max-h-[80vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-black uppercase tracking-wide font-brand mb-2">Chats & Circles</h2>
                  <div className="flex flex-col gap-2">
                    {chatRooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoom(room.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left font-semibold text-base ${activeRoom === room.id ? 'bg-blue-50 text-blue-700 shadow' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        <img src={room.avatar} alt={room.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="font-bold">{room.name}</div>
                          <div className="text-xs text-neutral-400 truncate">{room.type === 'group' ? 'Group' : room.type === 'mentor' ? 'Mentor' : 'Direct'}</div>
                        </div>
                        {room.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{room.unread}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Chat Window */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl border-0 p-6 flex flex-col h-[600px] min-h-[400px] max-h-[80vh]">
                  {activeRoomObj ? (
                    <>
                      {/* Chat Header */}
                      <div className="flex items-center gap-4 border-b border-neutral-100 pb-4 mb-4">
                        <img src={activeRoomObj.avatar} alt={activeRoomObj.name} className="w-12 h-12 rounded-full" />
                        <div>
                          <div className="font-bold text-lg text-black">{activeRoomObj.name}</div>
                          <div className="text-xs text-neutral-400">{activeRoomObj.type === 'group' ? 'Group Discussion' : activeRoomObj.type === 'mentor' ? 'Mentorship' : 'Direct Message'}</div>
                        </div>
                      </div>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto mb-4 pr-2" style={{ maxHeight: '380px' }}>
                        <div className="flex flex-col gap-4">
                          {activeRoomMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-black'}`} style={{ wordBreak: 'break-word' }}>
                                <div className="text-xs font-bold mb-1">{msg.sender}</div>
                                <div className="text-sm">{msg.text}</div>
                                <div className="text-[10px] text-neutral-300 mt-1 text-right">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                        <Input
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button type="submit" className="bg-black text-white rounded-full px-6 hover:bg-white hover:text-black border border-black">Send</Button>
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
          <div className="w-full max-w-xl mx-auto pointer-events-auto">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList
                className="flex flex-row gap-0 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-2xl w-full justify-between px-2 py-2 mb-0 mt-0 transition-all duration-300"
                style={{ minHeight: '3.5rem' }}
              >
                {tabItems.map(({ value, label, icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`mx-1 group relative flex flex-col items-center justify-center px-4 py-2 rounded-lg font-brand text-sm font-semibold transition-all duration-200 flex-1 max-w-[90px] cursor-pointer
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
                        className: `w-6 h-6 transition-all duration-200 ${tab === value ? 'text-blue-600 drop-shadow-tabicon' : 'text-neutral-400 group-hover:text-blue-500'}`
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
    </div>
  );
};

export default BridgeLab; 