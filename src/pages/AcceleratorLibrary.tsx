import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import { Playlist } from '@/types/playlist';
import { useNavigate } from 'react-router-dom';
import { PlaylistProvider } from '@/context/PlaylistContext';
import bridgelabLogo from '@/assets/bridgelab_logo.png';
// Placeholder for IdeaCard and AddIdeaModal (implement as needed)
// import IdeaCard from '@/components/IdeaCard';
// import AddIdeaModal from '@/components/AddIdeaModal';

interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  status: 'draft' | 'in-progress' | 'completed';
}

const dummyIdeas: Idea[] = [
  {
    id: '1',
    title: 'Smart Campus App',
    description: 'A platform to connect students, faculty, and resources for a smarter campus experience.',
    tags: ['Tech', 'Campus', 'App'],
    createdAt: new Date().toISOString(),
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Eco Startup',
    description: 'A startup focused on sustainable products and eco-friendly solutions.',
    tags: ['Eco', 'Startup'],
    createdAt: new Date().toISOString(),
    status: 'draft',
  },
];

// @source: https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator
// Uses playlist structure compatible with @PlaylistDetail.tsx and @VideoPlayer.tsx
const ycLecturePlaylist: Playlist = {
  id: 'yt-V979Wd1gmTU',
  title: 'How to Start a Startup - Y Combinator',
  description: 'A foundational lecture from Y Combinator on how to start a startup. [Source](https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator)',
  type: 'video',
  thumbnail: 'https://img.youtube.com/vi/V979Wd1gmTU/hqdefault.jpg',
  videos: [
    {
      id: 'V979Wd1gmTU',
      title: 'How to Start a Startup - Y Combinator',
      url: 'https://www.youtube.com/watch?v=V979Wd1gmTU&ab_channel=YCombinator',
      thumbnail: 'https://img.youtube.com/vi/V979Wd1gmTU/mqdefault.jpg',
      progress: 0,
      watchTime: 50
    }
  ],
  timeLock: {
    enabled: false,
    startTime: '00:00',
    endTime: '23:59',
    days: [0,1,2,3,4,5,6]
  },
  isPublic: true,
  invitedUsers: [],
  createdAt: new Date().toISOString(),
};

const AcceleratorLibrary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(dummyIdeas);
  const [tab, setTab] = useState('all');
  const [videoPlaylists, setVideoPlaylists] = useState<Playlist[]>([]);
  const navigate = useNavigate();

  // No-op function for readOnly PlaylistCard
  const noop = () => undefined;

  useEffect(() => {
    // Ensure the playlist is in localStorage for PlaylistDetail
    const key = 'youtubePlaylists';
    let playlists: Playlist[] = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) playlists = JSON.parse(stored);
    } catch {}
    if (!playlists.find(p => p.id === ycLecturePlaylist.id)) {
      playlists.push(ycLecturePlaylist);
      localStorage.setItem(key, JSON.stringify(playlists));
    }
    // Load all video playlists, but only show Y Combinator
    setVideoPlaylists(playlists.filter(p => p.type === 'video' && p.id === ycLecturePlaylist.id));
  }, []);

  // Add, delete, and update logic would go here

  return (
    <div className="min-h-screen bg-white flex flex-col items-center animate-fade-in font-sans relative" style={{ fontFamily: 'Space Grotesk, Inter, Helvetica Neue, Arial, sans-serif' }}>
      {/* Faint background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1.5px)', backgroundSize: '32px 32px', opacity: 0.18 }} />
      {/* Fixed Logo at top left */}
      <div className="fixed top-6 left-6 z-50 flex flex-col items-center">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white shadow-xl hover:from-yellow-600 hover:to-orange-500 transition-all duration-300 rounded-full p-1 flex items-center justify-center h-28 w-28">
          <img src={bridgelabLogo} alt="BridgeLab Logo" className="h-24 w-24 object-contain" />
        </div>
      </div>
      <div className="w-full max-w-5xl z-10" style={{ marginLeft: '9rem' }}>
        <Button
          variant="ghost"
          onClick={() => navigate('/bridgelab')}
          className="mb-4 mt-2 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          Back to BridgeLab
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Library of Lectures</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {videoPlaylists.map((playlist, idx) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onDelete={noop}
              delay={idx * 80}
              readOnly={true}
            />
          ))}
        </div>
        <div className="flex flex-col">
          {ideas.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="relative overflow-hidden group transition-all duration-300 shadow-xl rounded-xl px-6 py-2 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <span className="relative z-10 flex items-center">
                      <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                      Add Idea
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Tabs value={tab} onValueChange={setTab} className="w-full max-w-3xl animate-fade-in-up">
                    <TabsList className="w-full flex justify-between gap-2 p-2 rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-md">
                      <TabsTrigger value="all" className="flex-1 rounded-xl px-4 py-2 font-medium text-lg transition-all duration-300 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600">
                        <span className="relative z-10">All Ideas</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      <TabsTrigger value="draft" className="flex-1 rounded-xl px-4 py-2 font-medium text-lg transition-all duration-300 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600">
                        <span className="relative z-10">Drafts</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      <TabsTrigger value="in-progress" className="flex-1 rounded-xl px-4 py-2 font-medium text-lg transition-all duration-300 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600">
                        <span className="relative z-10">In Progress</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="flex-1 rounded-xl px-4 py-2 font-medium text-lg transition-all duration-300 relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600">
                        <span className="relative z-10">Completed</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {ideas.map((idea, index) => (
                          <div key={idea.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            {/* Replace with <IdeaCard idea={idea} /> when implemented */}
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h2 className="text-2xl font-bold text-blue-700">{idea.title}</h2>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">{idea.status}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{idea.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {idea.tags.map(tag => (
                                    <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{tag}</span>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Created: {new Date(idea.createdAt).toLocaleDateString()}</div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="draft" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {ideas.filter(i => i.status === 'draft').map((idea, index) => (
                          <div key={idea.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h2 className="text-2xl font-bold text-blue-700">{idea.title}</h2>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">{idea.status}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{idea.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {idea.tags.map(tag => (
                                    <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{tag}</span>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Created: {new Date(idea.createdAt).toLocaleDateString()}</div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="in-progress" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {ideas.filter(i => i.status === 'in-progress').map((idea, index) => (
                          <div key={idea.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h2 className="text-2xl font-bold text-blue-700">{idea.title}</h2>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">{idea.status}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{idea.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {idea.tags.map(tag => (
                                    <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{tag}</span>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Created: {new Date(idea.createdAt).toLocaleDateString()}</div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="completed" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {ideas.filter(i => i.status === 'completed').map((idea, index) => (
                          <div key={idea.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h2 className="text-2xl font-bold text-blue-700">{idea.title}</h2>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">{idea.status}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{idea.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {idea.tags.map(tag => (
                                    <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{tag}</span>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Created: {new Date(idea.createdAt).toLocaleDateString()}</div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AcceleratorLibraryPageWrapper() {
  return (
    <PlaylistProvider>
      <AcceleratorLibrary />
    </PlaylistProvider>
  );
} 