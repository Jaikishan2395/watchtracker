import { useState, useEffect } from 'react';
import { Plus, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/PlaylistCard';
import AddPlaylistModal from '@/components/AddPlaylistModal';
import { useTheme } from 'next-themes';
import { usePlaylists } from '@/context/PlaylistContext';
import { Playlist } from '@/types/playlist';

interface WatchTimeData {
  totalWatchTime: number;  // Total accumulated watch time in milliseconds
  lastPosition: number;    // Last video position in seconds
  lastUpdate: number;      // Timestamp of last update
  sessions: {              // Track individual watch sessions
    startTime: number;     // Session start timestamp
    endTime?: number;      // Session end timestamp
    duration: number;      // Session duration in milliseconds
  }[];
}

const Library = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playlists, addPlaylist, deletePlaylist } = usePlaylists();
  const { theme } = useTheme();

  // Add refresh functionality
  const refreshPlaylists = () => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists) as Playlist[];
        // Validate and update playlists in context
        parsedPlaylists.forEach(playlist => {
          // Only add if playlist doesn't exist and is valid
          if (!playlists.find(p => p.id === playlist.id)) {
            // Validate playlist before adding
            if (!playlist.id || !playlist.title || !playlist.type) {
              console.error('Invalid playlist data:', playlist);
              return;
            }

            // Additional validation for coding playlists
            if (playlist.type === 'coding') {
              if (!Array.isArray(playlist.codingQuestions) || playlist.codingQuestions.length === 0) {
                console.error('Coding playlist must have at least one question');
                return;
              }
              // Validate each coding question
              const invalidQuestions = playlist.codingQuestions.filter(q => 
                !q.id || !q.title || !q.difficulty || !q.category
              );
              if (invalidQuestions.length > 0) {
                console.error('Invalid coding questions found:', invalidQuestions);
                return;
              }
            }

            // Additional validation for video playlists
            if (playlist.type === 'video') {
              if (!Array.isArray(playlist.videos) || playlist.videos.length === 0) {
                console.error('Video playlist must have at least one video');
                return;
              }
            }

            addPlaylist(playlist);
          }
        });
      } catch (error) {
        console.error('Error refreshing playlists:', error);
      }
    }
  };

  // Add polling effect
  useEffect(() => {
    // Initial refresh
    refreshPlaylists();

    // Set up polling interval
    const pollInterval = setInterval(refreshPlaylists, 1000);

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists' || e.key === 'completedVideos') {
        refreshPlaylists();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playlists, addPlaylist]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshPlaylists();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playlists, addPlaylist]);

  // Add focus handler
  useEffect(() => {
    const handleFocus = () => {
      refreshPlaylists();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [playlists, addPlaylist]);

  // Filter playlists by type
  const videoPlaylists = playlists.filter(playlist => playlist.type === 'video');
  const codingPlaylists = playlists.filter(playlist => playlist.type === 'coding');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col">
          {playlists.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex justify-end mb-2">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className={`relative overflow-hidden group transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } text-white shadow-lg hover:shadow-xl h-9 px-4`}
                  >
                    <span className="relative z-10 flex items-center">
                      <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                      Add Content
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Tabs defaultValue="all" className="w-[600px]">
                    <TabsList className={`w-full ${
                      theme === 'dark'
                        ? 'bg-slate-800/40 backdrop-blur-md border border-slate-700/30'
                        : 'bg-white/60 backdrop-blur-md border border-gray-200/30'
                    } transition-all duration-300 rounded-2xl shadow-lg p-1`}>
                      <TabsTrigger 
                        value="all"
                        className={`${
                          theme === 'dark'
                            ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg'
                            : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg'
                        } transition-all duration-300 rounded-xl px-4 py-2 font-medium hover:bg-white/10 text-gray-600 dark:text-gray-300 flex-1 relative overflow-hidden group`}
                      >
                        <span className="relative z-10">All Content</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="videos"
                        className={`${
                          theme === 'dark'
                            ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg'
                            : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg'
                        } transition-all duration-300 rounded-xl px-4 py-2 font-medium hover:bg-white/10 text-gray-600 dark:text-gray-300 flex-1 relative overflow-hidden group`}
                      >
                        <span className="relative z-10">Video Playlists</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      <TabsTrigger 
                        value="coding"
                        className={`${
                          theme === 'dark'
                            ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg'
                            : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-purple-500/90 data-[state=active]:text-white data-[state=active]:shadow-lg'
                        } transition-all duration-300 rounded-xl px-4 py-2 font-medium hover:bg-white/10 text-gray-600 dark:text-gray-300 flex-1 relative overflow-hidden group`}
                      >
                        <span className="relative z-10">Coding Practice</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4">
                      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
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
                    
                    <TabsContent value="videos" className="mt-4">
                      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
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
                    
                    <TabsContent value="coding" className="mt-4">
                      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
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
                </div>
              </div>
            </div>
          )}
        </div>

        {playlists.length === 0 && (
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
        )}

        <AddPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPlaylist}
        />
      </div>
    </div>
  );
};

export default Library; 