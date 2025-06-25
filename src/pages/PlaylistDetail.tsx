import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Calendar, Edit3, Save, X, Plus, Play, Trash2, Share2, Users, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VideoCard from '@/components/VideoCard';
import AddVideoModal from '@/components/AddVideoModal';
import InviteModal from '@/components/InviteModal';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';
import { usePlaylists } from '@/context/PlaylistContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface CompletedVideo {
  id: string;
  title: string;
  playlistId: string;
  playlistTitle: string;
  completedAt: string;
  watchTime: number;
}

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 0px;
    display: none;
  }
  
  .custom-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    display: none;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    display: none;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    display: none;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-track {
    display: none;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    display: none;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    display: none;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = customScrollbarStyles;
document.head.appendChild(styleSheet);

const formatTimeForDisplay = (time: string, use24Hour: boolean = true): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = use24Hour ? hours : hours % 12 || 12;
  
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getTimeLockStatus = (timeLock: Playlist['timeLock']) => {
  if (!timeLock?.enabled) return { status: 'unlocked', message: 'Playlist is accessible 24/7' };
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  
  const [startHours, startMinutes] = timeLock.startTime.split(':').map(Number);
  const [endHours, endMinutes] = timeLock.endTime.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  const isDayAllowed = timeLock.days.includes(currentDay);
  
  // Check if current time is within the allowed range
  let isTimeInRange = false;
  if (endTimeInMinutes > startTimeInMinutes) {
    // Normal case: start time is before end time on the same day
    isTimeInRange = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  } else {
    // Special case: end time is on the next day
    isTimeInRange = currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }
  
  if (!isDayAllowed) {
    const nextAllowedDay = timeLock.days.find(day => day > currentDay) || timeLock.days[0];
    const daysUntilNext = (nextAllowedDay - currentDay + 7) % 7;
    return { 
      status: 'locked', 
      message: `Available on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextAllowedDay]} at ${formatTimeForDisplay(timeLock.startTime)} (${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''} from now)` 
    };
  }
  
  if (!isTimeInRange) {
    const nextAvailableDate = new Date(now);
    
    // If current time is past end time, set next available time to tomorrow
    if (currentTimeInMinutes > endTimeInMinutes) {
      nextAvailableDate.setDate(now.getDate() + 1);
    }
    
    nextAvailableDate.setHours(startHours, startMinutes, 0, 0);
    
    const timeUntilNext = nextAvailableDate.getTime() - now.getTime();
    const hoursUntilNext = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeMessage = '';
    if (hoursUntilNext > 0) {
      timeMessage = `${hoursUntilNext} hour${hoursUntilNext !== 1 ? 's' : ''}`;
      if (minutesUntilNext > 0) {
        timeMessage += ` and ${minutesUntilNext} minute${minutesUntilNext !== 1 ? 's' : ''}`;
      }
    } else {
      timeMessage = `${minutesUntilNext} minute${minutesUntilNext !== 1 ? 's' : ''}`;
    }
    
    return { 
      status: 'locked', 
      message: `Available in ${timeMessage} (at ${formatTimeForDisplay(timeLock.startTime)})` 
    };
  }
  
  return { status: 'unlocked', message: 'Currently accessible' };
};

const TimeLockInfo = ({ timeLock }: { timeLock: Playlist['timeLock'] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const lockStatus = getTimeLockStatus(timeLock);

  return (
    <>
      <Card 
        className="bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-200 animate-fade-in cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Access Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${lockStatus.status === 'unlocked' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {lockStatus.status === 'unlocked' ? (
                <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
              {lockStatus.message}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Access Schedule Details</DialogTitle>
            <DialogDescription>
              Detailed information about when this playlist is accessible
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${lockStatus.status === 'unlocked' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {lockStatus.status === 'unlocked' ? (
                  <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium">Current Status</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{lockStatus.message}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium">Time Range</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {timeLock?.enabled 
                      ? `Available from ${formatTimeForDisplay(timeLock.startTime)} to ${formatTimeForDisplay(timeLock.endTime)}`
                      : 'Available 24/7'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium">Available Days</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <span
                        key={day}
                        className={`text-xs px-2 py-1 rounded-full ${
                          timeLock?.enabled && timeLock.days.includes(index)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedPlaylistVideos, setFetchedPlaylistVideos] = useState<Video[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleFetchedVideos = (videos: Video[]) => {
    if (!playlist) return;

    // Add all fetched videos to the playlist at once
    const newVideos = videos.map(video => ({
      ...video,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0
    }));

    const updatedVideos = [...playlist.videos, ...newVideos];
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

    // Dispatch a custom event to notify VideoPlayer about the new videos
    const event = new CustomEvent('playlistUpdated', {
      detail: {
        playlistId: playlist.id,
        updatedPlaylist
      }
    });
    window.dispatchEvent(event);

    toast.success(`Added ${videos.length} videos to playlist`);
  };

  const handlePlayFetchedVideo = (video: Video) => {
    navigate(`/playlist/${playlistId}/play?video=${playlist?.videos.length || 0}`, {
      state: {
        video,
        playlist: {
          ...playlist,
          videos: [...(playlist?.videos || []), video]
        }
      }
    });
  };

  const addFetchedVideoToPlaylist = (video: Video) => {
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

    // Remove the video from fetched videos
    setFetchedPlaylistVideos(prev => prev.filter(v => v.id !== video.id));

    toast.success('Video added to playlist');
  };

  const handleInviteUser = () => {
    if (!playlist) return;

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if user is already invited
    const isAlreadyInvited = playlist.invitedUsers?.some(user => user.email === inviteEmail);
    if (isAlreadyInvited) {
      toast.error('User is already invited');
      return;
    }

    const updatedPlaylist = {
      ...playlist,
      invitedUsers: [
        ...(playlist.invitedUsers || []),
        {
          email: inviteEmail,
          username: inviteEmail.split('@')[0], // Use part before @ as username
          status: 'pending' as const,
          invitedAt: new Date().toISOString()
        }
      ]
    };

    updatePlaylist(updatedPlaylist);
    setInviteEmail('');
    setIsInviteModalOpen(false);
    toast.success('Invitation sent successfully');
  };

  const togglePublicAccess = () => {
    if (!playlist) return;

    const updatedPlaylist = {
      ...playlist,
      isPublic: !playlist.isPublic
    };

    updatePlaylist(updatedPlaylist);
    setIsPublic(!playlist.isPublic);
    toast.success(updatedPlaylist.isPublic ? 'Playlist is now public' : 'Playlist is now private');
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
  const lockStatus = getTimeLockStatus(playlist.timeLock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800/95 dark:to-indigo-950/95 transition-colors duration-200">
      <div className="container mx-auto px-4 pb-8 max-w-6xl">
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() =>
              playlist.id === 'yt-V979Wd1gmTU'
                ? navigate('/acceleratorlibrary')
                : navigate('/library')
            }
            className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {playlist.id === 'yt-V979Wd1gmTU' ? 'Back to Accelerator Library' : 'Back to Library'}
          </Button>
          
          <div className="relative w-full h-[400px] mb-8 rounded-2xl overflow-hidden shadow-2xl">
            {playlist.thumbnail ? (
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : playlist.videos.length > 0 ? (
              <img
                src={playlist.videos[0].thumbnail}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No videos in playlist</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">{playlist.title}</h1>
              <p className="text-gray-200 text-lg max-w-3xl drop-shadow-md">{playlist.description}</p>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-slate-700/30 transition-colors duration-200 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                    <p className="font-semibold">{completedVideos}/{playlist.videos.length} completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Watch Time</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(watchedTime)}/{Math.round(totalDuration)} min</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {playlist.id !== 'yt-V979Wd1gmTU' && (
                  <>
                    <Button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg px-6"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                    <Button
                      onClick={() => setIsAddVideoModalOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Video
                    </Button>
                  </>
                )}
                <Button
                  onClick={handlePlayAll}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg px-6"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play All
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-200 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={totalProgress} className="h-3 mb-2 bg-gray-200 dark:bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">{Math.round(totalProgress)}% Complete</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-200 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Watched:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(watchedTime)} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Remaining:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(totalDuration - watchedTime)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {playlist.id !== 'yt-V979Wd1gmTU' && (
              <TimeLockInfo timeLock={playlist.timeLock} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                  Uncompleted Videos
                </h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  {uncompletedVideos.length} {uncompletedVideos.length === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
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
                        className="cursor-pointer relative"
                        onClick={() => handleVideoClick(video)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full rounded-lg shadow-md"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          #{index + 1}
                        </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                    Completed Videos
                  </h2>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm">
                    {completedVideosList.length} {completedVideosList.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar opacity-80">
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
                        className="cursor-pointer relative"
                        onClick={() => handleVideoClick(video)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full rounded-lg shadow-md"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          #{playlist.videos.findIndex(v => v.id === video.id) + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {fetchedPlaylistVideos.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">
                  Fetched Playlist Videos
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                  {fetchedPlaylistVideos.length} {fetchedPlaylistVideos.length === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {fetchedPlaylistVideos.map((video, index) => (
                  <div 
                    key={video.id}
                    className="relative transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="absolute right-2 top-2 z-10 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          addFetchedVideoToPlaylist(video);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => handlePlayFetchedVideo(video)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="custom-scrollbar-styles" />

        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          onClose={() => setIsAddVideoModalOpen(false)}
          onAdd={addVideoToPlaylist}
          onFetchedVideos={handleFetchedVideos}
        />

        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite to Playlist</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-access" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Public Access
                </Label>
                <Switch
                  id="public-access"
                  checked={playlist?.isPublic || false}
                  onCheckedChange={togglePublicAccess}
                />
              </div>
              {playlist?.invitedUsers && playlist.invitedUsers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Invited Users</h4>
                  <div className="space-y-2">
                    {playlist.invitedUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          user.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {playlist && (
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            playlist={playlist}
            onInvite={updatePlaylist}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;