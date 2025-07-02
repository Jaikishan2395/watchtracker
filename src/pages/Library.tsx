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
  const filteredPlaylists = playlists.filter(
    playlist => !playlist.title.toLowerCase().includes('y combinator')
  );
  const videoPlaylists = filteredPlaylists.filter(playlist => playlist.type === 'video');
  const codingPlaylists = filteredPlaylists.filter(playlist => playlist.type === 'coding');

  // 1. Add a new filtered list for completed playlists
  const completedPlaylists = filteredPlaylists.filter(playlist => {
    if (playlist.type === 'video') {
      return playlist.videos && playlist.videos.length > 0 && playlist.videos.every(v => v.progress >= 100);
    }
    if (playlist.type === 'coding') {
      return playlist.codingQuestions && playlist.codingQuestions.length > 0 && playlist.codingQuestions.every(q => q.solved);
    }
    return false;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-300/20 to-pink-300/10 rounded-full blur-2xl z-0" />
      <div className="container mx-auto px-4 relative z-10 mt-12">
        <div className="flex flex-col">
          {playlists.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex justify-end mb-4 gap-4">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="relative overflow-hidden group transition-all duration-300 shadow-xl rounded-full px-4 py-1 text-base font-semibold bg-white text-black hover:bg-black hover:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <Plus className="w-4 h-4 mr-2 text-black group-hover:text-white transition-colors" />
                    Add Content
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/learningtrack'}
                    className="relative overflow-hidden group transition-all duration-300 shadow-xl rounded-full px-4 py-1 text-base font-semibold bg-white text-black hover:bg-black hover:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <Code className="w-4 h-4 mr-2 text-black group-hover:text-white transition-colors" />
                    Learning Track
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Tabs defaultValue="all" className="w-full max-w-3xl animate-fade-in-up">
                    <TabsList className="w-full flex justify-between gap-2 p-3 rounded-full shadow-2xl bg-white/80 backdrop-blur-md">
                      <TabsTrigger 
                        value="all"
                        className="flex-1 rounded-full px-6 py-3 font-extrabold text-lg transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 hover:text-black hover:scale-105"
                      >
                        All Content
                      </TabsTrigger>
                      <TabsTrigger 
                        value="videos"
                        className="flex-1 rounded-full px-6 py-3 font-extrabold text-lg transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 hover:text-black hover:scale-105"
                      >
                        Video Playlists
                      </TabsTrigger>
                      <TabsTrigger 
                        value="coding"
                        className="flex-1 rounded-full px-6 py-3 font-extrabold text-lg transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 hover:text-black hover:scale-105"
                      >
                        Coding Practice
                      </TabsTrigger>
                      <TabsTrigger 
                        value="complete"
                        className="flex-1 rounded-full px-6 py-3 font-extrabold text-lg transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=inactive]:bg-white data-[state=inactive]:text-black hover:bg-gray-100 hover:text-black hover:scale-105"
                      >
                        Complete
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {filteredPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 100}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="videos" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {videoPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 100}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="coding" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {codingPlaylists.map((playlist, index) => (
                          <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                            <PlaylistCard
                              playlist={playlist}
                              onDelete={deletePlaylist}
                              delay={index * 100}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="complete" className="mt-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                        {completedPlaylists.length > 0 ? (
                          completedPlaylists.map((playlist, index) => (
                            <div key={playlist.id} className="transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${index * 80}ms`}}>
                              <PlaylistCard
                                playlist={playlist}
                                onDelete={deletePlaylist}
                                delay={index * 100}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-12">No completed playlists yet.</div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
        {playlists.length === 0 && (
          <Card className={`mt-12 max-w-2xl mx-auto animate-fade-in-up ${
            theme === 'dark'
              ? 'bg-slate-800/60 backdrop-blur-md border-slate-700'
              : 'bg-white/80 backdrop-blur-md border-0'
          } shadow-xl transition-all duration-300`}>
            <CardContent className="py-20 text-center flex flex-col items-center">
              {/* Placeholder for engaging illustration */}
              <div className="mb-6">
                <svg width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#6366F1" fillOpacity="0.08"/><rect x="30" y="50" width="60" height="30" rx="8" fill="#6366F1" fillOpacity="0.15"/><rect x="45" y="40" width="30" height="10" rx="4" fill="#6366F1" fillOpacity="0.25"/></svg>
              </div>
              <h3 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Start Your Learning Journey</h3>
              <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Create your first playlist to track videos and coding problems</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="relative overflow-hidden group transition-all duration-300 shadow-lg rounded-full px-4 py-1 text-base font-semibold bg-white text-black hover:bg-black hover:text-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <Plus className="w-4 h-4 mr-2 text-black group-hover:text-white transition-colors" />
                Create Content
              </Button>
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