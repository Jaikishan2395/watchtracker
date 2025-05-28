import { useState, useEffect } from 'react';
import { Plus, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import AddPlaylistModal from '@/components/AddPlaylistModal';
import { Playlist } from '@/types/playlist';
import { useTheme } from 'next-themes';

const Library = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { theme } = useTheme();

  // Load playlists from localStorage on component mount
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  // Filter playlists by type
  const videoPlaylists = playlists.filter(playlist => playlist.type === 'video');
  const codingPlaylists = playlists.filter(playlist => playlist.type === 'coding');

  const deletePlaylist = (id: string) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          } transition-colors duration-300`}>
            Your Learning Content
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className={`relative overflow-hidden group transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white shadow-lg hover:shadow-xl`}
          >
            <span className="relative z-10 flex items-center">
              <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
              Add Content
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>

        {/* Playlists with Tabs */}
        {playlists.length === 0 ? (
          <Card className={`${
            theme === 'dark'
              ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700'
              : 'bg-white/70 backdrop-blur-sm border-0'
          } shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardContent className="py-20 text-center">
              <div className="animate-fade-in space-y-4">
                <div className={`${
                  theme === 'dark' ? 'text-blue-400' : 'text-gray-400'
                } transition-colors duration-300`}>
                  <Code className="w-20 h-20 mx-auto mb-4 transform hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className={`text-2xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-600'
                } transition-colors duration-300`}>
                  Start Your Learning Journey
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } transition-colors duration-300 mb-8`}>
                  Create your first playlist to track videos and coding problems
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className={`relative overflow-hidden group transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  } text-white shadow-lg hover:shadow-xl`}
                >
                  <span className="relative z-10 flex items-center">
                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                    Create Content
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className={`${
              theme === 'dark'
                ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700'
                : 'bg-white/70 backdrop-blur-sm'
            } transition-colors duration-300`}>
              <TabsTrigger 
                value="all"
                className={`${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                    : 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
                } transition-colors duration-300`}
              >
                All Content
              </TabsTrigger>
              <TabsTrigger 
                value="videos"
                className={`${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                    : 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
                } transition-colors duration-300`}
              >
                Video Playlists
              </TabsTrigger>
              <TabsTrigger 
                value="coding"
                className={`${
                  theme === 'dark'
                    ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                    : 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
                } transition-colors duration-300`}
              >
                Coding Practice
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist, index) => (
                  <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                    <PlaylistCard
                      playlist={playlist}
                      onDelete={deletePlaylist}
                      delay={index * 100}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoPlaylists.map((playlist, index) => (
                  <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                    <PlaylistCard
                      playlist={playlist}
                      onDelete={deletePlaylist}
                      delay={index * 100}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="coding" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {codingPlaylists.map((playlist, index) => (
                  <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                    <PlaylistCard
                      playlist={playlist}
                      onDelete={deletePlaylist}
                      delay={index * 100}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <AddPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(newPlaylist) => {
            const updatedPlaylists = [...playlists, newPlaylist];
            setPlaylists(updatedPlaylists);
            localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default Library; 