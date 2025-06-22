import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Plus, Users, Info, X, Star, Share2, Sparkles, MessageCircle, Calendar as CalendarIcon, Send, Search, Paperclip, Image as ImageIcon, UserCheck } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Dummy data for clubs
const dummyClubs = [
  {
    id: 1,
    name: 'Math Club',
    description: 'A club for students who love solving math problems and participating in math olympiads.',
    members: [
      { name: 'Alice', avatar: '', role: 'Member' },
      { name: 'Bob', avatar: '', role: 'Member' },
      { name: 'Mr. Smith', avatar: '', role: 'Advisor' },
    ],
    isMember: true,
    tags: ['math', 'olympiad', 'problem-solving'],
    emoji: '📐',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 2,
    name: 'Science Explorers',
    description: 'Explore the wonders of science with experiments, projects, and guest lectures.',
    members: [
      { name: 'Bob', avatar: '', role: 'Member' },
      { name: 'Mrs. Johnson', avatar: '', role: 'Advisor' },
    ],
    isMember: false,
    tags: ['science', 'experiments', 'projects'],
    emoji: '🔬',
    color: 'from-green-400 to-emerald-400',
  },
  {
    id: 3,
    name: 'Art & Creativity',
    description: 'A space for artists to collaborate, learn, and showcase their work.',
    members: [
      { name: 'Diana', avatar: '', role: 'Member' },
      { name: 'Ms. Rodriguez', avatar: '', role: 'Advisor' },
    ],
    isMember: false,
    tags: ['art', 'creativity', 'exhibition'],
    emoji: '🎨',
    color: 'from-pink-400 to-yellow-300',
  },
];

const emojiOptions = ['📐', '🔬', '🎨', '🎵', '⚽', '💻', '📚', '🎭', '🧩', '🌱', '🧪', '🏆', '📝', '��', '🧑‍🍳'];

const roleOptions = ['President', 'Member', 'Advisor'];

const dummyJoinRequests = [
  { name: 'Charlie', role: 'Pending', avatar: '' },
  { name: 'Diana', role: 'Pending', avatar: '' },
];

const dummyAchievements = [
  { id: 1, label: 'Most Active', icon: '🔥' },
  { id: 2, label: 'Award Winner', icon: '🏆' },
];

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState(dummyClubs);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '', tags: '', emoji: emojiOptions[0], color: 'from-purple-400 to-pink-400' });
  const [selectedClub, setSelectedClub] = useState(null);
  const [showClubDetails, setShowClubDetails] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  // Announcements/posts per club
  const [clubPosts, setClubPosts] = useState({
    1: [
      { id: 1, author: 'Mr. Smith', content: 'Next Math Olympiad practice is on Friday!', date: '2024-06-10' },
      { id: 2, author: 'Alice', content: 'Can we review combinatorics next meeting?', date: '2024-06-09' },
    ],
    2: [
      { id: 1, author: 'Mrs. Johnson', content: 'Science fair registration closes this week!', date: '2024-06-08' },
    ],
    3: [],
  });
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  // Events per club
  const [clubEvents, setClubEvents] = useState({
    1: [
      { id: 1, title: 'Olympiad Practice', date: '2024-06-14', location: 'Room 101' },
    ],
    2: [
      { id: 1, title: 'Lab Safety Workshop', date: '2024-06-12', location: 'Lab 2' },
    ],
    3: [],
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });
  // Chat per club
  const [clubChats, setClubChats] = useState({
    1: [
      { id: 1, sender: 'Alice', content: 'Hi everyone!' },
      { id: 2, sender: 'Mr. Smith', content: 'Hello Alice!' },
    ],
    2: [],
    3: [],
  });
  const [newChatMsg, setNewChatMsg] = useState('');
  // File/image uploads for announcements and chat
  const [announcementFiles, setAnnouncementFiles] = useState([]);
  const [chatFiles, setChatFiles] = useState([]);
  // RSVP/attendance for events
  const [eventRSVP, setEventRSVP] = useState({}); // { [eventId]: { going: [usernames], interested: [usernames] } }
  // Role management
  const [memberRoles, setMemberRoles] = useState({}); // { [clubId]: { [memberName]: role } }
  // Club gallery
  const [clubGallery, setClubGallery] = useState({ 1: [], 2: [], 3: [] });
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryFile, setGalleryFile] = useState(null);
  // Tab state for club details
  const [clubTab, setClubTab] = useState('announcements');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [joinRequests, setJoinRequests] = useState({ 1: [...dummyJoinRequests], 2: [], 3: [] });
  const [clubNotifications, setClubNotifications] = useState({ posts: true, events: true, chat: true });
  // Club edit state
  const [editClub, setEditClub] = useState(null);
  const navigate = useNavigate();

  const handleJoin = (clubId) => {
    setClubs(clubs.map(club => club.id === clubId ? { ...club, isMember: true } : club));
  };

  const handleLeave = (clubId) => {
    setClubs(clubs.map(club => club.id === clubId ? { ...club, isMember: false } : club));
  };

  const handleCreateClub = () => {
    if (newClub.name && newClub.description) {
      setClubs([
        {
          id: clubs.length + 1,
          name: newClub.name,
          description: newClub.description,
          members: [{ name: 'You', avatar: '', role: 'Member' }],
          isMember: true,
          tags: newClub.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          emoji: newClub.emoji,
          color: newClub.color,
        },
        ...clubs,
      ]);
      setShowCreateModal(false);
      setNewClub({ name: '', description: '', tags: '', emoji: emojiOptions[0], color: 'from-purple-400 to-pink-400' });
    }
  };

  // Color options for club banners
  const colorOptions = [
    'from-purple-400 to-pink-400',
    'from-green-400 to-emerald-400',
    'from-pink-400 to-yellow-300',
    'from-blue-400 to-indigo-400',
    'from-orange-400 to-red-400',
    'from-cyan-400 to-blue-400',
  ];

  // Search/filter logic
  const allTags = Array.from(new Set(clubs.flatMap(club => club.tags)));
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || club.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  // File/image upload handlers
  const handleAnnouncementFile = (e) => {
    const files = Array.from(e.target.files) as File[];
    setAnnouncementFiles(files.map((file: File) => ({ file, url: URL.createObjectURL(file) })));
  };
  const handleChatFile = (e) => {
    const files = Array.from(e.target.files) as File[];
    setChatFiles(files.map((file: File) => ({ file, url: URL.createObjectURL(file) })));
  };
  const handleGalleryFile = (e) => {
    const file = e.target.files[0] as File;
    if (file) setGalleryFile({ file, url: URL.createObjectURL(file) });
  };
  const addGalleryImage = () => {
    if (galleryFile && selectedClub) {
      setClubGallery(prev => ({
        ...prev,
        [selectedClub.id]: [galleryFile, ...(prev[selectedClub.id] || [])]
      }));
      setGalleryFile(null);
      setShowGalleryModal(false);
    }
  };

  // RSVP handlers
  const handleRSVP = (eventId, type) => {
    setEventRSVP(prev => {
      const current = prev[eventId] || { going: [], interested: [] };
      const user = 'You';
      const updated = { ...current };
      if (type === 'going') {
        updated.going = current.going.includes(user) ? current.going : [...current.going, user];
        updated.interested = current.interested.filter(u => u !== user);
      } else {
        updated.interested = current.interested.includes(user) ? current.interested : [...current.interested, user];
        updated.going = current.going.filter(u => u !== user);
      }
      return { ...prev, [eventId]: updated };
    });
  };

  // Role management handlers
  const handleRoleChange = (clubId, memberName, newRole) => {
    setMemberRoles(prev => ({
      ...prev,
      [clubId]: { ...(prev[clubId] || {}), [memberName]: newRole }
    }));
  };

  // Notification logic
  const clearClubNotifications = () => setClubNotifications({ posts: false, events: false, chat: false });
  const showToast = (msg) => toast(msg);

  // Admin check
  const isAdmin = selectedClub && selectedClub.members.some(m => m.name === 'You' && (memberRoles[selectedClub.id]?.[m.name] || m.role) !== 'Member');

  // Remove member
  const removeMember = (clubId, memberName) => {
    setClubs(prev => prev.map(club => club.id === clubId ? { ...club, members: club.members.filter(m => m.name !== memberName) } : club));
  };
  // Approve join request
  const approveJoin = (clubId, req) => {
    setJoinRequests(prev => ({ ...prev, [clubId]: prev[clubId].filter(r => r.name !== req.name) }));
    setClubs(prev => prev.map(club => club.id === clubId ? { ...club, members: [...club.members, { name: req.name, avatar: '', role: 'Member' }] } : club));
  };
  // Reject join request
  const rejectJoin = (clubId, req) => {
    setJoinRequests(prev => ({ ...prev, [clubId]: prev[clubId].filter(r => r.name !== req.name) }));
  };
  // Delete club
  const deleteClub = (clubId) => {
    setClubs(prev => prev.filter(club => club.id !== clubId));
    setShowClubDetails(false);
  };
  // Save club edits
  const saveClubEdit = () => {
    setClubs(prev => prev.map(club => club.id === editClub.id ? { ...club, ...editClub } : club));
    setEditClub(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 via-white to-pink-100 py-0 px-4">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {/* Back Button */}
      <div className="w-full max-w-4xl mx-auto mt-6 mb-2 flex items-center">
        <Button
          variant="outline"
          className="rounded-full px-6 py-2 text-base font-semibold shadow hover:bg-purple-100 transition-all duration-200"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto mt-10 mb-8 rounded-3xl shadow-xl bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="bg-white/30 rounded-full p-5 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow mb-1">Clubs</h1>
            <p className="text-lg text-white/90 font-medium">Discover, join, and create vibrant student clubs!</p>
          </div>
        </div>
        <Button
          className="ml-auto bg-white/20 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:bg-white/40 hover:text-purple-900 transition-all duration-200 text-lg relative"
          onClick={() => { setShowCreateModal(true); clearClubNotifications(); }}
        >
          <Plus className="w-5 h-5 mr-2" /> Create Club
          {(clubNotifications.posts || clubNotifications.events || clubNotifications.chat) && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg">!</span>
          )}
        </Button>
        <div className="absolute right-8 bottom-0 opacity-30 text-white text-8xl pointer-events-none select-none">🏆</div>
      </div>

      {/* Search and Filter Bar */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
          <Input
            placeholder="Search clubs by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-lg border-2 border-purple-200 focus:border-purple-400 bg-white/90 shadow-sm rounded-xl"
          />
        </div>
        <select
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="px-6 py-3 border-2 border-purple-200 focus:border-purple-400 rounded-xl bg-white/90 shadow-sm text-lg font-medium"
        >
          <option value="all">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Club Cards Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {filteredClubs.map(club => (
          <Card
            key={club.id}
            className={`relative shadow-2xl border-0 rounded-3xl overflow-hidden group transition-transform duration-200 hover:scale-[1.025] hover:ring-2 hover:ring-${club.color.split(' ')[0].replace('from-', '')}/40`}
          >
            {/* Club Banner */}
            <div className={`h-28 w-full bg-gradient-to-r ${club.color} flex items-center justify-between px-6 py-4 relative`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">{club.emoji}</span>
                <span className="text-xl font-bold text-white drop-shadow">{club.name}</span>
                {/* Achievements */}
                {dummyAchievements.map(a => (
                  <span key={a.id} className="ml-2 text-lg" title={a.label}>{a.icon}</span>
                ))}
              </div>
              {club.isMember && (
                <Badge className="bg-white/80 text-purple-700 font-bold px-4 py-1 shadow-lg">Joined</Badge>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-white/30 hover:bg-white/50 text-white"
                onClick={() => { setSelectedClub(club); setShowClubDetails(true); clearClubNotifications(); }}
              >
                <Info className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="pt-6 pb-4 px-6 flex flex-col gap-4">
              <p className="text-gray-700 text-base line-clamp-2 min-h-[48px]">{club.description}</p>
              <div className="flex flex-wrap gap-2">
                {club.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs bg-white/80 border-purple-200 text-purple-700">#{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                {/* Members Avatars */}
                <div className="flex -space-x-2">
                  {club.members.slice(0, 4).map((member, idx) => (
                    <Avatar key={idx} className="h-9 w-9 border-2 border-white shadow">
                      <AvatarFallback className="bg-purple-400 text-white text-xs">{member.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {club.members.length > 4 && (
                    <div className="h-9 w-9 flex items-center justify-center bg-purple-200 text-purple-700 rounded-full text-xs font-bold border-2 border-white">+{club.members.length - 4}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {club.isMember ? (
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 font-semibold" onClick={() => handleLeave(club.id)}>
                      Leave
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-semibold" onClick={() => handleJoin(club.id)}>
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Club Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a New Club</DialogTitle>
            <DialogDescription>Fill in the details to create your club. Choose an emoji and color for your club banner!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-4 text-3xl shadow-lg bg-gradient-to-r ${newClub.color}`}>{newClub.emoji}</div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
                  {emojiPickerOpen ? 'Close Emoji Picker' : 'Pick Emoji'}
                </Button>
                {emojiPickerOpen && (
                  <div className="grid grid-cols-8 gap-1 bg-white rounded-lg p-2 shadow-lg max-w-xs">
                    {emojiOptions.map((emoji, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`text-xl ${newClub.emoji === emoji ? 'bg-purple-100' : ''}`}
                        onClick={() => { setNewClub({ ...newClub, emoji }); setEmojiPickerOpen(false); }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {colorOptions.map((color, idx) => (
                <button
                  key={idx}
                  className={`w-10 h-6 rounded-full border-2 ${newClub.color === color ? 'border-purple-600' : 'border-gray-200'} bg-gradient-to-r ${color}`}
                  onClick={() => setNewClub({ ...newClub, color })}
                  aria-label={`Pick color ${color}`}
                />
              ))}
            </div>
            <Input
              placeholder="Club Name"
              value={newClub.name}
              onChange={e => setNewClub({ ...newClub, name: e.target.value })}
              maxLength={32}
            />
            <Textarea
              placeholder="Description (max 120 chars)"
              value={newClub.description}
              onChange={e => setNewClub({ ...newClub, description: e.target.value.slice(0, 120) })}
              rows={3}
              maxLength={120}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={newClub.tags}
              onChange={e => setNewClub({ ...newClub, tags: e.target.value })}
              maxLength={48}
            />
            <div className="text-xs text-gray-500">Tip: Use a fun emoji and color to make your club stand out!</div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateClub} disabled={!newClub.name || !newClub.description} className="bg-purple-500 text-white font-bold">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Club Details Modal (add Settings tab for admins) */}
      <Dialog open={showClubDetails} onOpenChange={open => { setShowClubDetails(open); if (!open) setEditClub(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Club Details</DialogTitle>
          </DialogHeader>
          {selectedClub && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className={`rounded-2xl p-6 text-5xl shadow-lg bg-gradient-to-r ${selectedClub.color}`}>{selectedClub.emoji}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedClub.name}</h3>
                  <p className="text-gray-600 mb-2">{selectedClub.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedClub.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs bg-white/80 border-purple-200 text-purple-700">#{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      <Share2 className="w-4 h-4 mr-1" /> Share Club
                    </Button>
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      <Star className="w-4 h-4 mr-1" /> Favorite
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Members:</span>
                <div className="flex flex-wrap gap-3 mt-3">
                  {selectedClub.members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-1 shadow">
                      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => { setProfileData(member); setShowProfileModal(true); }}>
                        <AvatarFallback className="bg-purple-400 text-white text-xs">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-base text-gray-800 font-medium cursor-pointer" onClick={() => { setProfileData(member); setShowProfileModal(true); }}>{member.name}</span>
                      <span className="text-xs text-purple-600 font-semibold ml-1">{memberRoles[selectedClub.id]?.[member.name] || member.role}</span>
                      {/* If 'You' is in club, allow role change for demo */}
                      {member.name !== 'You' && selectedClub.members.some(m => m.name === 'You') && (
                        <select
                          value={memberRoles[selectedClub.id]?.[member.name] || member.role}
                          onChange={e => handleRoleChange(selectedClub.id, member.name, e.target.value)}
                          className="text-xs ml-2 rounded border border-purple-200"
                        >
                          {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex gap-2 flex-wrap border-b pb-2 mb-4">
                  <Button variant={clubTab==='announcements'?"default":"ghost"} className="text-purple-700 font-bold" onClick={() => setClubTab('announcements')}>Announcements</Button>
                  <Button variant={clubTab==='events'?"default":"ghost"} className="text-purple-700 font-bold" onClick={() => setClubTab('events')}>Events</Button>
                  <Button variant={clubTab==='chat'?"default":"ghost"} className="text-purple-700 font-bold" onClick={() => setClubTab('chat')}>Chat</Button>
                  <Button variant={clubTab==='gallery'?"default":"ghost"} className="text-purple-700 font-bold" onClick={() => setClubTab('gallery')}>Gallery</Button>
                  {isAdmin && <Button variant={clubTab==='settings'?"default":"ghost"} className="text-purple-700 font-bold" onClick={() => setClubTab('settings')}>Settings</Button>}
                </div>
                {/* Announcements Tab */}
                {clubTab==='announcements' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Announcements</span>
                      <div className="flex gap-2">
                        <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleAnnouncementFile} className="hidden" id="announcement-file-upload" />
                        <label htmlFor="announcement-file-upload">
                          <Button size="icon" variant="outline"><Paperclip className="w-4 h-4" /></Button>
                        </label>
                        <Button size="sm" variant="outline" onClick={() => setShowPostModal(true)}><MessageCircle className="w-4 h-4 mr-1" /> New Post</Button>
                      </div>
                    </div>
                    {/* File previews */}
                    {announcementFiles.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {announcementFiles.map((f, i) => f.file.type.startsWith('image/') ? (
                          <img key={i} src={f.url} alt="preview" className="h-12 w-12 rounded object-cover" />
                        ) : (
                          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{f.file.name}</a>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(clubPosts[selectedClub.id] || []).map(post => (
                        <div key={post.id} className="bg-purple-50 rounded-lg p-3 shadow flex flex-col">
                          <span className="font-semibold text-purple-700">{post.author}</span>
                          <span className="text-gray-700">{post.content}</span>
                          <span className="text-xs text-gray-400 mt-1">{post.date}</span>
                        </div>
                      ))}
                      {(!clubPosts[selectedClub.id] || clubPosts[selectedClub.id].length === 0) && <div className="text-gray-400 italic">No announcements yet.</div>}
                    </div>
                  </div>
                )}
                {/* Events Tab */}
                {clubTab==='events' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Events</span>
                      <Button size="sm" variant="outline" onClick={() => setShowEventModal(true)}><CalendarIcon className="w-4 h-4 mr-1" /> Add Event</Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(clubEvents[selectedClub.id] || []).map(event => (
                        <div key={event.id} className="bg-pink-50 rounded-lg p-3 shadow flex flex-col">
                          <span className="font-semibold text-pink-700">{event.title}</span>
                          <span className="text-gray-700">{event.date} @ {event.location}</span>
                          <div className="flex gap-2 mt-1">
                            <Button size="sm" variant="outline" className="text-green-700 border-green-300" onClick={() => handleRSVP(event.id, 'going')}>Going ({(eventRSVP[event.id]?.going?.length || 0)})</Button>
                            <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300" onClick={() => handleRSVP(event.id, 'interested')}>Interested ({(eventRSVP[event.id]?.interested?.length || 0)})</Button>
                          </div>
                          {(eventRSVP[event.id]?.going?.length > 0 || eventRSVP[event.id]?.interested?.length > 0) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {eventRSVP[event.id]?.going?.length > 0 && <span>Going: {eventRSVP[event.id].going.join(', ')} </span>}
                              {eventRSVP[event.id]?.interested?.length > 0 && <span>Interested: {eventRSVP[event.id].interested.join(', ')}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!clubEvents[selectedClub.id] || clubEvents[selectedClub.id].length === 0) && <div className="text-gray-400 italic">No events yet.</div>}
                    </div>
                  </div>
                )}
                {/* Chat Tab */}
                {clubTab==='chat' && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Club Chat</span>
                    <div className="bg-white rounded-lg p-3 shadow mt-2 max-h-32 overflow-y-auto space-y-2">
                      {(clubChats[selectedClub.id] || []).map(msg => (
                        <div key={msg.id} className="flex gap-2 items-center">
                          <span className="font-bold text-purple-700">{msg.sender}:</span>
                          <span className="text-gray-800">{msg.content}</span>
                          {msg.file && msg.file.type.startsWith('image/') && <img src={msg.file.url} alt="chat-img" className="h-8 w-8 rounded ml-2" />}
                          {msg.file && !msg.file.type.startsWith('image/') && <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline ml-2">{msg.file.file.name}</a>}
                        </div>
                      ))}
                      {(!clubChats[selectedClub.id] || clubChats[selectedClub.id].length === 0) && <div className="text-gray-400 italic">No messages yet.</div>}
                    </div>
                    <div className="flex gap-2 mt-2 items-center">
                      <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleChatFile} className="hidden" id="chat-file-upload" />
                      <label htmlFor="chat-file-upload">
                        <Button size="icon" variant="outline"><Paperclip className="w-4 h-4" /></Button>
                      </label>
                      <Input
                        placeholder="Type a message..."
                        value={newChatMsg}
                        onChange={e => setNewChatMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newChatMsg.trim()) {
                          setClubChats(prev => ({
                            ...prev,
                            [selectedClub.id]: [...(prev[selectedClub.id] || []), { id: Date.now(), sender: 'You', content: newChatMsg, file: chatFiles[0] }]
                          }));
                          setNewChatMsg('');
                          setChatFiles([]);
                          showToast('Message sent!');
                        }}}
                        className="flex-1"
                      />
                      <Button onClick={() => {
                        if (newChatMsg.trim()) {
                          setClubChats(prev => ({
                            ...prev,
                            [selectedClub.id]: [...(prev[selectedClub.id] || []), { id: Date.now(), sender: 'You', content: newChatMsg, file: chatFiles[0] }]
                          }));
                          setNewChatMsg('');
                          setChatFiles([]);
                          showToast('Message sent!');
                        }
                      }}><Send className="w-4 h-4" /></Button>
                      {chatFiles.length > 0 && chatFiles.map((f, i) => f.file.type.startsWith('image/') ? (
                        <img key={i} src={f.url} alt="preview" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{f.file.name}</a>
                      ))}
                    </div>
                  </div>
                )}
                {/* Gallery Tab */}
                {clubTab==='gallery' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Club Gallery</span>
                      <Button size="sm" variant="outline" onClick={() => setShowGalleryModal(true)}><ImageIcon className="w-4 h-4 mr-1" /> Add Image</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(clubGallery[selectedClub.id] || []).map((img, idx) => (
                        <img key={idx} src={img.url} alt="gallery" className="rounded-lg h-24 w-full object-cover" />
                      ))}
                      {(!clubGallery[selectedClub.id] || clubGallery[selectedClub.id].length === 0) && <div className="text-gray-400 italic col-span-3">No images yet.</div>}
                    </div>
                  </div>
                )}
                {/* Settings Tab (admin only) */}
                {clubTab==='settings' && isAdmin && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-purple-700 mb-2">Club Settings</h3>
                    {/* Edit club info */}
                    <div className="space-y-2">
                      <Input value={editClub?.name ?? selectedClub.name} onChange={e => setEditClub({ ...(editClub || selectedClub), name: e.target.value })} placeholder="Club Name" />
                      <Textarea value={editClub?.description ?? selectedClub.description} onChange={e => setEditClub({ ...(editClub || selectedClub), description: e.target.value })} placeholder="Description" />
                      <Input value={editClub?.tags?.join(', ') ?? selectedClub.tags.join(', ')} onChange={e => setEditClub({ ...(editClub || selectedClub), tags: e.target.value.split(',').map(t => t.trim()) })} placeholder="Tags (comma separated)" />
                      <div className="flex gap-2">
                        {emojiOptions.map((emoji, idx) => (
                          <Button key={idx} variant="ghost" size="sm" className={editClub?.emoji === emoji ? 'bg-purple-100' : ''} onClick={() => setEditClub({ ...(editClub || selectedClub), emoji })}>{emoji}</Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {colorOptions.map((color, idx) => (
                          <button key={idx} className={`w-10 h-6 rounded-full border-2 ${editClub?.color === color ? 'border-purple-600' : 'border-gray-200'} bg-gradient-to-r ${color}`} onClick={() => setEditClub({ ...(editClub || selectedClub), color })} aria-label={`Pick color ${color}`} />
                        ))}
                      </div>
                      <Button onClick={saveClubEdit} className="bg-purple-500 text-white">Save Changes</Button>
                    </div>
                    {/* Join requests */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-purple-700 mb-2">Join Requests</h4>
                      {joinRequests[selectedClub.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {joinRequests[selectedClub.id].map(req => (
                            <div key={req.name} className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-1 shadow">
                              <Avatar className="h-7 w-7"><AvatarFallback className="bg-purple-400 text-white text-xs">{req.name[0]}</AvatarFallback></Avatar>
                              <span className="text-base text-gray-800 font-medium">{req.name}</span>
                              <Button size="sm" variant="outline" className="text-green-700 border-green-300" onClick={() => approveJoin(selectedClub.id, req)}>Approve</Button>
                              <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={() => rejectJoin(selectedClub.id, req)}>Reject</Button>
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-gray-400 italic">No join requests.</div>}
                    </div>
                    {/* Remove members */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-purple-700 mb-2">Remove Members</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClub.members.filter(m => m.name !== 'You').map(member => (
                          <div key={member.name} className="flex items-center gap-2 bg-pink-50 rounded-lg px-3 py-1 shadow">
                            <Avatar className="h-7 w-7"><AvatarFallback className="bg-pink-400 text-white text-xs">{member.name[0]}</AvatarFallback></Avatar>
                            <span className="text-base text-gray-800 font-medium">{member.name}</span>
                            <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={() => removeMember(selectedClub.id, member.name)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Delete club */}
                    <div className="mt-4">
                      <Button onClick={() => deleteClub(selectedClub.id)} className="bg-red-500 text-white">Delete Club</Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowClubDetails(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write your announcement..."
            value={newPostText}
            onChange={e => setNewPostText(e.target.value)}
            rows={3}
          />
          <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleAnnouncementFile} className="mt-2" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPostModal(false)}>Cancel</Button>
            <Button onClick={() => {
              if (newPostText.trim() && selectedClub) {
                setClubPosts(prev => ({
                  ...prev,
                  [selectedClub.id]: [
                    { id: Date.now(), author: 'You', content: newPostText, date: new Date().toISOString().split('T')[0], files: announcementFiles },
                    ...(prev[selectedClub.id] || [])
                  ]
                }));
                setNewPostText('');
                setAnnouncementFiles([]);
                setShowPostModal(false);
                showToast('Announcement posted!');
              }
            }} disabled={!newPostText.trim()} className="bg-purple-500 text-white">Post</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Event Title"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            className="mb-2"
          />
          <Input
            type="date"
            value={newEvent.date}
            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Location"
            value={newEvent.location}
            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
            className="mb-2"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowEventModal(false)}>Cancel</Button>
            <Button onClick={() => {
              if (newEvent.title && newEvent.date && selectedClub) {
                setClubEvents(prev => ({
                  ...prev,
                  [selectedClub.id]: [
                    { id: Date.now(), title: newEvent.title, date: newEvent.date, location: newEvent.location },
                    ...(prev[selectedClub.id] || [])
                  ]
                }));
                setNewEvent({ title: '', date: '', location: '' });
                setShowEventModal(false);
                showToast('Event added!');
              }
            }} disabled={!newEvent.title || !newEvent.date} className="bg-pink-500 text-white">Add Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Modal */}
      <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image to Gallery</DialogTitle>
          </DialogHeader>
          <input type="file" accept="image/*" onChange={handleGalleryFile} className="mb-2" />
          {galleryFile && <img src={galleryFile.url} alt="preview" className="rounded-lg h-32 w-full object-cover mb-2" />}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowGalleryModal(false)}>Cancel</Button>
            <Button onClick={addGalleryImage} disabled={!galleryFile} className="bg-purple-500 text-white">Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {profileData && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-3"><AvatarFallback className="bg-purple-400 text-white text-3xl font-bold">{profileData.name[0]}</AvatarFallback></Avatar>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name}</h3>
                <Badge variant="outline" className="mb-2">{profileData.role}</Badge>
                <p className="text-blue-700 text-sm">Email: <span className="underline">{profileData.name.toLowerCase().replace(/ /g, '.')}@school.edu</span></p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Clubs:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {clubs.filter(club => club.members.some(m => m.name === profileData.name)).map(club => (
                    <Badge key={club.id} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">{club.name}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Recent Activity:</span>
                <div className="text-sm text-gray-600 mt-1">(Demo) No recent activity.</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clubs; 