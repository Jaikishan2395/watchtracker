import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle, RotateCcw, Timer, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Update the YouTube API types at the top of the file
interface YouTubePlayer {
  destroy: () => void;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getVideoData: () => { title: string };
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

interface YouTubePlayerVars {
  autoplay?: number;
  controls?: number;
  modestbranding?: number;
  rel?: number;
  origin?: string;
  enablejsapi?: number;
  widget_referrer?: string;
}

interface YouTubePlayerEvents {
  onStateChange?: (event: YouTubePlayerEvent) => void;
  onReady?: (event: YouTubePlayerEvent) => void;
  onError?: (event: YouTubePlayerEvent) => void;
}

interface YouTubeAPI {
  Player: new (
    elementId: HTMLElement,
    options: {
      videoId: string;
      playerVars?: YouTubePlayerVars;
      events?: YouTubePlayerEvents;
    }
  ) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
    UNSTARTED: number;
  };
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

// Add these styles at the top of the file, after the imports
const styles = `
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
`;

// Add this after the styles declaration
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const videoIndex = parseInt(searchParams.get('video') || '0');
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex);
  const [showAllVideos, setShowAllVideos] = useState(true);
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({
    totalWatchTime: 0,
    lastPosition: 0,
    lastUpdate: Date.now(),
    sessions: []
  });
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const initializationAttemptsRef = useRef<number>(0);

  // Get current video from playlist
  const currentVideo = playlist?.videos[currentVideoIndex];

  // Move these useMemo declarations to the top, before any effects
  const uncompletedVideos = useMemo(() => 
    playlist?.videos.filter(video => video.progress < 100) || [],
    [playlist?.videos]
  );

  const completedVideosList = useMemo(() => 
    playlist?.videos.filter(video => video.progress >= 100) || [],
    [playlist?.videos]
  );

  // Load playlist data
  useEffect(() => {
    const loadPlaylistData = async () => {
      setIsLoading(true);
      try {
        // First try to get playlist from navigation state
        const statePlaylist = location.state?.playlist as Playlist | undefined;
        if (statePlaylist) {
          setPlaylist(statePlaylist);
          setIsLoading(false);
          return;
        }

        // Fall back to localStorage if no state data
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const found = playlists.find(p => p.id === id);
          if (found) {
            setPlaylist(found);
            // Save to state to prevent loss on refresh
            window.history.replaceState(
              { playlist: found },
              '',
              window.location.href
            );
          } else {
            navigate('/');
            toast.error('Playlist not found');
          }
        } else {
          navigate('/');
          toast.error('No playlists found');
        }
      } catch (error) {
        console.error('Error loading playlist:', error);
        toast.error('Error loading playlist');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      loadPlaylistData();
      setIsInitialized(true);
    }
  }, [id, location.state, navigate, isInitialized]);

  // Initialize watch time data when video changes
  useEffect(() => {
    if (!playlist || !currentVideo) return;

    // Load existing watch time data from localStorage
    const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as WatchTimeData;
        setWatchTimeData(parsedData);
      } catch (e) {
        console.error('Error loading watch time data:', e);
      }
    } else {
      // Initialize new watch time data
      setWatchTimeData({
        totalWatchTime: 0,
        lastPosition: 0,
        lastUpdate: Date.now(),
        sessions: []
      });
    }

    // Reset session tracking
    sessionStartTime.current = null;
    lastUpdateTime.current = Date.now();

    return () => {
      // Save watch time data when component unmounts or video changes
      if (currentVideo && watchTimeData) {
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(watchTimeData));
      }
    };
  }, [currentVideo?.id, watchTimeData, playlist]);

  // Function to start tracking watch time
  const startWatchTimeTracking = () => {
    if (!playerRef.current || !currentVideo || sessionStartTime.current !== null) return;

    const now = Date.now();
    sessionStartTime.current = now;
    lastUpdateTime.current = now;

    // Start the update interval
    updateInterval.current = setInterval(() => {
      if (!playerRef.current || !sessionStartTime.current || !currentVideo) return;

      const currentTime = Date.now();
      const elapsed = currentTime - lastUpdateTime.current;
      lastUpdateTime.current = currentTime;

      // Update watch time data
      setWatchTimeData(prev => {
        const currentPosition = Math.floor(playerRef.current!.getCurrentTime());
        return {
          ...prev,
          totalWatchTime: prev.totalWatchTime + elapsed,
          lastPosition: currentPosition,
          lastUpdate: currentTime,
          sessions: prev.sessions.map((session, index) => 
            index === prev.sessions.length - 1 && !session.endTime
              ? { ...session, duration: session.duration + elapsed }
              : session
          )
        };
      });
    }, 100); // Update every 100ms for better precision

    // Add new session
    setWatchTimeData(prev => ({
      ...prev,
      sessions: [...prev.sessions, {
        startTime: now,
        duration: 0
      }]
    }));
  };

  // Function to stop tracking watch time
  const stopWatchTimeTracking = () => {
    if (!sessionStartTime.current || !currentVideo) return;

    const now = Date.now();
    const sessionDuration = now - sessionStartTime.current;

    // Clear the update interval
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }

    // Update the last session and save to localStorage
    setWatchTimeData(prev => {
      const updatedSessions = [...prev.sessions];
      const lastSession = updatedSessions[updatedSessions.length - 1];
      if (lastSession && !lastSession.endTime) {
        lastSession.endTime = now;
        lastSession.duration = sessionDuration;
      }

      const finalData = {
        ...prev,
        sessions: updatedSessions,
        lastUpdate: now
      };

      // Save to localStorage
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(finalData));
      return finalData;
    });

    sessionStartTime.current = null;
  };

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === id);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        setPlaylist(updatedPlaylist);
      }
    }
    
    toast.success('Progress updated!');
  };

  const selectVideo = (index: number) => {
    if (index === currentVideoIndex) return; // Don't reload if same video
    
    // Check if there are any uncompleted videos
    if (uncompletedVideos.length === 0) {
      setShowCompletionDialog(true);
      return;
    }
    
    // Stop current video playback
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    
    // Update URL without triggering a full navigation
    const newUrl = `/playlist/${id}/play?video=${index}`;
    window.history.pushState({}, '', newUrl);
    
    // Update state
    setCurrentVideoIndex(index);
    
    // Destroy current player instance
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    // Force player reinitialization
    setIsPlayerReady(false);
    setTimeout(() => {
      setIsPlayerReady(true);
    }, 100);
    
    toast.success(`Now playing: ${playlist?.videos[index].title}`);
  };

  const goToNextVideo = () => {
    if (playlist && currentVideoIndex < playlist.videos.length - 1) {
      if (uncompletedVideos.length === 0) {
        setShowCompletionDialog(true);
        return;
      }
      selectVideo(currentVideoIndex + 1);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      if (uncompletedVideos.length === 0) {
        setShowCompletionDialog(true);
        return;
      }
      selectVideo(currentVideoIndex - 1);
    }
  };

  const markAsComplete = () => {
    if (playlist && currentVideo) {
      // Create a new array of videos with the updated progress
      const updatedVideos = playlist.videos.map(video => {
        if (video.id === currentVideo.id) {
          return { ...video, progress: 100 };
        }
        return video;
      });

      // Create a new playlist object
      const updatedPlaylist = {
        ...playlist,
        videos: updatedVideos
      };

      // Update localStorage
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        try {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const index = playlists.findIndex(p => p.id === id);
          if (index !== -1) {
            playlists[index] = updatedPlaylist;
            localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }

      // Update state with the new playlist
      setPlaylist(updatedPlaylist);

      // Check if this was the last uncompleted video
      const remainingUncompleted = updatedVideos.filter(v => v.progress < 100).length;
      if (remainingUncompleted === 0) {
        // Stop the current video
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          playerRef.current.destroy();
          playerRef.current = null;
        }
        // Show completion dialog
        setShowCompletionDialog(true);
        // Reset player ready state to prevent auto-initialization
        setIsPlayerReady(false);
      }

      // Show a special toast notification with animation
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>
            <span className="font-semibold">{currentVideo.title}</span>
            {remainingUncompleted === 0 ? ' completed! All videos are now finished!' : ' marked as complete!'}
          </span>
        </div>,
        {
          duration: 3000,
          className: "animate-slide-in-right",
        }
      );
    }
  };

  const resetAllData = () => {
    localStorage.removeItem('youtubePlaylists');
    toast.success('All data has been reset!');
    navigate('/');
  };

  // Add this function near the top of the component
  const extractVideoIdFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Update the player initialization effect
  useEffect(() => {
    let playerInstance: YouTubePlayer | null = null;

    const initializePlayer = () => {
      if (!isPlayerReady || !iframeRef.current || !playlist) {
        return;
      }

      // Don't initialize player if all videos are completed
      if (uncompletedVideos.length === 0) {
        setShowCompletionDialog(true);
        return;
      }

      const currentVideo = playlist.videos[currentVideoIndex];
      if (!currentVideo) {
        return;
      }

      // Don't initialize if the current video is completed
      if (currentVideo.progress >= 100 && uncompletedVideos.length > 0) {
        // Find the first uncompleted video and switch to it
        const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (firstUncompletedIndex !== -1) {
          selectVideo(firstUncompletedIndex);
          return;
        }
      }

      const videoId = extractVideoIdFromUrl(currentVideo.url);
      if (!videoId) {
        console.error('Could not extract video ID from URL:', currentVideo.url);
        toast.error('Invalid YouTube URL format');
        return;
      }

      try {
        // Always create a new player instance
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        const playerOptions = {
          videoId,
          playerVars: {
            autoplay: currentVideo.progress < 100 ? 1 : 0, // Only autoplay uncompleted videos
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
            enablejsapi: 1,
            widget_referrer: window.location.href
          } as YouTubePlayerVars,
          events: {
            onStateChange: (event: YouTubePlayerEvent) => {
              // Don't track watch time for completed videos
              if (currentVideo.progress >= 100) {
                if (playerRef.current) {
                  playerRef.current.pauseVideo();
                }
                return;
              }

              if (event.data === window.YT.PlayerState.PLAYING) {
                startWatchTimeTracking();
              } else if (event.data === window.YT.PlayerState.PAUSED || 
                         event.data === window.YT.PlayerState.ENDED) {
                stopWatchTimeTracking();
              }
            },
            onReady: (event: YouTubePlayerEvent) => {
              playerRef.current = playerInstance;
              const videoData = event.target.getVideoData();
              setVideoTitle(videoData.title);
              
              // Only play if the video is not completed
              if (currentVideo.progress < 100) {
                // Resume from last position
                const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
                if (savedData) {
                  try {
                    const watchData = JSON.parse(savedData) as WatchTimeData;
                    if (watchData.lastPosition > 0) {
                      playerRef.current?.seekTo(watchData.lastPosition);
                    }
                  } catch (e) {
                    console.error('Error loading watch time data:', e);
                  }
                }
                
                // Start playing the video
                playerRef.current?.playVideo();
              } else {
                // Pause the video if it's completed
                playerRef.current?.pauseVideo();
                // If there are uncompleted videos, switch to the first one
                if (uncompletedVideos.length > 0) {
                  const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
                  if (firstUncompletedIndex !== -1) {
                    selectVideo(firstUncompletedIndex);
                  }
                } else {
                  setShowCompletionDialog(true);
                }
              }
            },
            onError: (event: YouTubePlayerEvent) => {
              console.error('YouTube player error:', event.data);
              let errorMessage = 'An error occurred while playing the video.';
              
              switch (event.data) {
                case 2:
                  errorMessage = 'Invalid video ID. Please check the video URL.';
                  break;
                case 5:
                  errorMessage = 'HTML5 player error. Please try a different browser.';
                  break;
                case 100:
                  errorMessage = 'Video not found or has been removed.';
                  break;
                case 101:
                case 150:
                  errorMessage = 'Video embedding is not allowed.';
                  break;
              }
              
              toast.error(errorMessage);
            }
          } as YouTubePlayerEvents
        };

        playerInstance = new window.YT.Player(iframeRef.current, playerOptions);
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        toast.error('Failed to initialize video player. Please try again.');
      }
    };

    // Initialize player
    initializePlayer();

    return () => {
      stopWatchTimeTracking();
      if (playerInstance) {
        playerInstance.destroy();
        playerInstance = null;
      }
    };
  }, [isPlayerReady, playlist, currentVideoIndex, uncompletedVideos.length]);

  // Add an effect to handle completion state changes
  useEffect(() => {
    if (uncompletedVideos.length === 0 && playerRef.current) {
      playerRef.current.pauseVideo();
      setShowCompletionDialog(true);
    }
  }, [uncompletedVideos.length]);

  // Handle browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state to sessionStorage
      if (playlist) {
        sessionStorage.setItem('currentPlaylist', JSON.stringify({
          playlist,
          videoIndex: currentVideoIndex,
          timestamp: Date.now()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for saved state on mount
    const savedState = sessionStorage.getItem('currentPlaylist');
    if (savedState && !playlist) {
      try {
        const { playlist: savedPlaylist, videoIndex: savedIndex, timestamp } = JSON.parse(savedState);
        // Only restore if the saved state is less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setPlaylist(savedPlaylist);
          setCurrentVideoIndex(savedIndex);
          window.history.replaceState(
            { playlist: savedPlaylist },
            '',
            `/playlist/${id}/play?video=${savedIndex}`
          );
        }
      } catch (e) {
        console.error('Error restoring saved state:', e);
      }
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playlist, currentVideoIndex, id]);

  // Update the YouTube API loading effect
  useEffect(() => {
    console.log('Loading YouTube API...');
    
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already loaded');
      setIsPlayerReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready!');
      setIsPlayerReady(true);
    };

    return () => {
      console.log('Cleaning up YouTube player...');
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Reset watch time tracking when video changes
  useEffect(() => {
    stopWatchTimeTracking();
  }, [currentVideoIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading playlist...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Playlist not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to WatchMap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Video not found</p>
            <Button onClick={() => navigate(`/playlist/${id}`)} className="mt-4">
              Back to Playlist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;

  // Format time with millisecond precision
  const formatTimeWithPrecision = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ${milliseconds}ms`;
    }
    return `${seconds}s ${milliseconds}ms`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {playlist && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Playlist
                </Button>
              )}
              <div className="text-2xl font-bold text-gray-800 dark:text-white">WatchMap</div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
            
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              Video {currentVideoIndex + 1} of {playlist.videos.length}
            </p>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Overall Progress: {Math.round(totalProgress)}%</span>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
              >
                <List className="w-4 h-4 mr-2" />
                {showAllVideos ? 'Hide Videos' : 'Show Videos'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-xl">
                  <div ref={iframeRef} className="w-full h-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Video Info */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl dark:text-white">
                    {videoTitle || currentVideo.title}
                  </CardTitle>
                  {currentVideo.progress >= 100 && (
                    <Badge className="bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700">
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(currentVideo.watchTime || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Progress: {currentVideo.progress}%</span>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                    {/* Main Watch Time Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100/80 dark:bg-blue-900/30 p-2.5 rounded-lg">
                          <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Watch Time</div>
                          <div 
                            className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                            onClick={() => {
                              if (currentVideo.watchTime) {
                                playerRef.current?.seekTo(currentVideo.watchTime);
                              }
                            }}
                            title="Click to continue from last watched position"
                          >
                            {formatTimeWithPrecision(watchTimeData.totalWatchTime)}
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/30 px-2.5 py-1 rounded-full group-hover:bg-blue-200/80 dark:group-hover:bg-blue-800/30 transition-colors">
                              continue watching
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={markAsComplete}
                          className={`transition-all duration-200 ${
                            currentVideo.progress >= 100
                              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {currentVideo.progress >= 100 ? 'Completed' : 'Complete'}
                        </Button>
                        <div className="text-right bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Current Position</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {formatTime(currentVideo.watchTime || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-blue-100/50 dark:border-blue-800/50">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Watch Sessions</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/50">
                            {watchTimeData.sessions.length} {watchTimeData.sessions.length === 1 ? 'session' : 'sessions'}
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/50 text-right">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Last Updated</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(watchTimeData.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Active Session Indicator */}
                    {sessionStartTime.current && (
                      <div className="mt-4 bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50 animate-pulse">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Timer className="w-4 h-4" />
                          <span className="font-medium">Current Session</span>
                        </div>
                        <div className="mt-1 text-lg font-semibold text-blue-900 dark:text-blue-300">
                          {formatTimeWithPrecision(Date.now() - sessionStartTime.current)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousVideo}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                    className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">
                    {currentVideoIndex + 1} / {playlist.videos.length}
                  </span>
                  
                  <Button
                    onClick={goToNextVideo}
                    disabled={currentVideoIndex === playlist.videos.length - 1}
                    variant="outline"
                    className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                  >
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Playlist Sidebar */}
          <div className="space-y-4">
            {/* Uncompleted Videos */}
            {showAllVideos && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Uncompleted Videos</h3>
                  <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                    {uncompletedVideos.length}
                  </Badge>
                </div>
                {uncompletedVideos.length === 0 ? (
                  <div className="text-gray-600 dark:text-slate-400 text-sm">No uncompleted videos.</div>
                ) : (
                  <div className="space-y-3">
                    {uncompletedVideos.map((video, index) => (
                      <Card
                        key={video.id}
                        className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-500 hover:shadow-xl cursor-pointer animate-fade-in ${
                          index === currentVideoIndex 
                            ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/80 dark:bg-blue-900/20' 
                            : ''
                        }`}
                        onClick={() => selectVideo(index)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                index === currentVideoIndex
                                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                  : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200'
                              }`}
                            >
                              {index === currentVideoIndex ? (
                                <Play className="w-4 h-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p 
                                  className={`text-sm font-medium truncate ${
                                    index === currentVideoIndex 
                                      ? 'text-blue-700 dark:text-blue-400'
                                      : 'text-gray-800 dark:text-slate-200'
                                  }`}
                                >
                                  {video.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600 dark:text-slate-400">
                                  {formatDuration(video.watchTime || 0)}
                                </span>
                                <span className="text-xs text-gray-600 dark:text-slate-400">
                                  {video.progress}% Watched
                                </span>
                                {index === currentVideoIndex && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                                    Now Playing
                                  </Badge>
                                )}
                              </div>
                              <Progress 
                                value={video.progress} 
                                className="h-2 mt-2 dark:bg-slate-700"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Videos */}
            {completedVideosList.length > 0 && (
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Completed Videos</h3>
                  <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                    {completedVideosList.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {completedVideosList.map((video, index) => (
                    <Card
                      key={video.id}
                      className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-500 hover:shadow-xl opacity-70 animate-slide-in-right ${
                        index === currentVideoIndex ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/80 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div 
                            onClick={() => selectVideo(index)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all cursor-pointer hover:scale-110 ${
                              video.progress >= 100 
                                ? 'bg-green-600 dark:bg-green-700 text-white' 
                                : index === currentVideoIndex
                                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200'
                            }`}
                          >
                            {video.progress >= 100 ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : index === currentVideoIndex ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p 
                              onClick={() => selectVideo(index)}
                              className={`text-sm font-medium truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                                index === currentVideoIndex ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-slate-200'
                              }`}
                            >
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 dark:text-slate-400">{formatDuration(video.watchTime || 0)}</span>
                              <span className="text-xs text-gray-600 dark:text-slate-400">{video.progress}%</span>
                              {index === currentVideoIndex && (
                                <Badge variant="outline" className="text-xs px-1 py-0 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                                  Now Playing
                                </Badge>
                              )}
                            </div>
                            <Progress 
                              value={video.progress} 
                              className="h-2 mt-2 dark:bg-slate-700"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              All Videos Completed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-300 mt-2">
              Congratulations! You have completed all videos in this playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => {
                if (playlist?.id) {
                  navigate(`/playlist/${playlist.id}`);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Return to Playlist
            </Button>
          </div>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoPlayer;
