import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Calendar, Edit3, Save, X, Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VideoCard from '@/components/VideoCard';
import AddVideoModal from '@/components/AddVideoModal';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';
import { usePlaylists } from '@/context/PlaylistContext';

interface CompletedVideo {
  id: string;
  title: string;
  playlistId: string;
  playlistTitle: string;
  completedAt: string;
  watchTime: number;
}

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateTotalVideosCount } = usePlaylists();

  const loadPlaylistData = () => {
    try {
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (!savedPlaylists) {
        throw new Error('No playlists found in localStorage');
      }

      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      if (!Array.isArray(playlists)) {
        throw new Error('Playlists data is not an array');
      }

      const found = playlists.find(p => p.id === playlistId);
      if (!found) {
        throw new Error(`No playlist found with ID: ${playlistId}`);
      }

      if (found.type !== 'video') {
        throw new Error(`Playlist ${playlistId} is not a video playlist`);
      }

      // Initialize completedVideos as an empty array if not found or invalid
      let completedVideos: CompletedVideo[] = [];
      try {
        const savedCompletedVideos = localStorage.getItem('completedVideos');
        if (savedCompletedVideos) {
          const parsed = JSON.parse(savedCompletedVideos);
          if (Array.isArray(parsed)) {
            completedVideos = parsed;
          } else {
            console.warn('completedVideos in localStorage is not an array, initializing as empty array');
            localStorage.setItem('completedVideos', '[]');
          }
        } else {
          localStorage.setItem('completedVideos', '[]');
        }
      } catch (error) {
        console.error('Error parsing completedVideos:', error);
        localStorage.setItem('completedVideos', '[]');
      }

      const updatedVideos = found.videos.map(video => {
        const completedVideo = completedVideos.find(cv => cv.id === video.id);
        if (completedVideo) {
          return { ...video, progress: 100 };
        }
        return video;
      });
      const updatedPlaylist = { ...found, videos: updatedVideos };
      setPlaylist(updatedPlaylist);
      setError(null);
      
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      setError(error instanceof Error ? error.message : 'Failed to load playlist');
    }
  };

  useEffect(() => {
    loadPlaylistData();
  }, [playlistId]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists' || e.key === 'completedVideos') {
        loadPlaylistData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playlistId]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadPlaylistData();
    }, 1000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [playlistId]);

  const updatePlaylist = (updatedPlaylist: Playlist) => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        setPlaylist(updatedPlaylist);
        updateTotalVideosCount();
      }
    }
  };

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    updatePlaylist(updatedPlaylist);

    if (progress >= 100) {
      const video = playlist.videos.find(v => v.id === videoId);
      if (video) {
        // Initialize completedVideos as an empty array if not found or invalid
        let completedVideos: CompletedVideo[] = [];
        try {
          const savedCompletedVideos = localStorage.getItem('completedVideos');
          if (savedCompletedVideos) {
            const parsed = JSON.parse(savedCompletedVideos);
            if (Array.isArray(parsed)) {
              completedVideos = parsed;
            } else {
              console.warn('completedVideos in localStorage is not an array, initializing as empty array');
              localStorage.setItem('completedVideos', '[]');
            }
          } else {
            localStorage.setItem('completedVideos', '[]');
          }
        } catch (error) {
          console.error('Error parsing completedVideos:', error);
          localStorage.setItem('completedVideos', '[]');
        }

        const videoToStore: CompletedVideo = {
          id: video.id,
          title: video.title,
          playlistId: playlist.id,
          playlistTitle: playlist.title,
          completedAt: new Date().toISOString(),
          watchTime: video.watchTime || 0
        };

        const existingIndex = completedVideos.findIndex((v: CompletedVideo) => v.id === videoId);
        if (existingIndex === -1) {
          completedVideos.push(videoToStore);
          localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
        }
      }
    }

    toast.success('Progress updated!');
  };

  const addVideoToPlaylist = (video: Omit<Video, 'id' | 'progress'>) => {
    if (!playlist) return;

    const newVideo: Video = {
      ...video,
      id: `${Date.now()}`,
      progress: 0
    };

    const updatedVideos = [...playlist.videos, newVideo];
    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    
    // Update localStorage for playlists
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
      }
    }

    // Update state
    setPlaylist(updatedPlaylist);
    updateTotalVideosCount();

    // Dispatch a custom event to notify VideoPlayer about the new video
    const event = new CustomEvent('playlistUpdated', {
      detail: {
        playlistId: playlist.id,
        updatedPlaylist
      }
    });
    window.dispatchEvent(event);

    toast.success('Video added to playlist');
  };

  const deleteVideoFromPlaylist = (videoId: string) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.filter(video => video.id !== videoId);
    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    updatePlaylist(updatedPlaylist);
    toast.success('Video removed from playlist');
  };

  const handleVideoClick = (video: Video) => {
    navigate(`/playlist/${playlistId}/play?video=${playlist.videos.findIndex(v => v.id === video.id)}`, { 
      state: { 
        video,
        playlist 
      }
    });
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.videos.length === 0) return;
    
    const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
    const startIndex = firstUncompletedIndex !== -1 ? firstUncompletedIndex : 0;
    
    navigate(`/playlist/${playlistId}/play?video=${startIndex}`, {
      state: {
        video: playlist.videos[startIndex],
        playlist
      }
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/library')} className="mt-4">
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
          <CardContent className="py-8 text-center">
            <p className="text-gray-800 dark:text-gray-100">Loading playlist...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;
  
  const totalDuration = playlist.videos.reduce((sum, video) => sum + video.watchTime, 0);
  const watchedTime = playlist.videos.reduce((sum, video) => {
    return sum + (video.watchTime * video.progress / 100);
  }, 0);

  const uncompletedVideos = playlist.videos.filter(video => video.progress < 100);
  const completedVideosList = playlist.videos.filter(video => video.progress >= 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800/95 dark:to-indigo-950/95 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          
          <div className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-slate-700/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-2 transition-colors duration-200">{playlist.title}</h1>
                <p className="text-gray-600 dark:text-gray-200 mb-4 transition-colors duration-200">{playlist.description}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayAll}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play All
                </Button>
                <Button
                  onClick={() => setIsAddVideoModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{Math.round(watchedTime)}/{Math.round(totalDuration)} min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={totalProgress} className="h-3 mb-2 bg-gray-200 dark:bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" />
              <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">{Math.round(totalProgress)}% Complete</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Watched:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(watchedTime)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Remaining:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(totalDuration - watchedTime)} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                Uncompleted Videos
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                {uncompletedVideos.length} {uncompletedVideos.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
            <div className="space-y-4">
              {uncompletedVideos.length > 0 ? (
                uncompletedVideos.map((video, index) => (
                  <div 
                    key={video.id}
                    className="relative transform transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="absolute right-4 top-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVideoFromPlaylist(video.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    >
                      <VideoCard
                        video={video}
                        onProgressUpdate={(progress) => updateVideoProgress(video.id, progress)}
                        delay={index * 50}
                        index={index}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/50 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 rounded-lg border border-gray-200/50 dark:border-slate-700/30">
                  <p className="text-gray-600 dark:text-gray-200 transition-colors duration-200">
                    All videos are completed! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {completedVideosList.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                  Completed Videos
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                  {completedVideosList.length} {completedVideosList.length === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <div className="space-y-4 opacity-80">
                {completedVideosList.map((video, index) => (
                  <div 
                    key={video.id}
                    className="relative transform transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="absolute right-4 top-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVideoFromPlaylist(video.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    >
                      <VideoCard
                        video={video}
                        onProgressUpdate={(progress) => updateVideoProgress(video.id, progress)}
                        delay={index * 50}
                        index={index}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          onClose={() => setIsAddVideoModalOpen(false)}
          onAdd={addVideoToPlaylist}
        />
      </div>
    </div>
  );
};

export default PlaylistDetail;