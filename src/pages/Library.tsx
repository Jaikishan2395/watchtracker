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

  const markAsComplete = () => {
    // ... other code ...
    const videoToStore: CompletedVideo = {
      id: currentVideo.id,
      title: currentVideo.title,
      playlistId: playlist.id,
      playlistTitle: playlist.title,
      completedAt: new Date().toISOString(),
      watchTime: watchTimeData.totalWatchTime  // Store total watch time with completion
    };
    // ... other code ...
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
          onAdd={addPlaylist}
        />
      </div>
    </div>
  );
};

export default Library; 