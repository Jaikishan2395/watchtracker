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
  playCount: number;       // Number of times video was played
  stopCount: number;       // Number of times video was stopped
  cumulativeTime: number;  // Total time spent watching the video
}

interface CompletedVideo {
  id: string;
  title: string;
  playlistId: string;
  playlistTitle: string;
  completedAt: string;
  watchTime: number;
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
    playCount: 0,
    stopCount: 0,
    cumulativeTime: 0
  });
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());

  // Get current video from playlist
  const currentVideo = playlist?.videos[currentVideoIndex];

  // Move these useMemo declarations to the top, before any effects
  const uncompletedVideos = useMemo(() => 
    playlist?.videos.filter(video => video.progress < 100) || [],
    [playlist?.videos, playlist?.videos.map(v => v.progress)]
  );

  const completedVideosList = useMemo(() => 
    playlist?.videos.filter(video => video.progress >= 100) || [],
    [playlist?.videos, playlist?.videos.map(v => v.progress)]
  );

  // Add this effect to handle playlist updates
  useEffect(() => {
    const handlePlaylistUpdate = (event: CustomEvent) => {
      const { playlistId: updatedPlaylistId, updatedPlaylist } = event.detail;
      if (updatedPlaylistId === id) {
        // Update the playlist state
        setPlaylist(updatedPlaylist);
        
        // If we're currently playing the last video, update the currentVideoIndex
        if (currentVideoIndex === playlist?.videos.length - 1) {
          setCurrentVideoIndex(updatedPlaylist.videos.length - 1);
        }
      }
    };

    // Add event listener for playlist updates
    window.addEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);

    return () => {
      window.removeEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);
    };
  }, [id, currentVideoIndex, playlist?.videos.length]);

  // Add polling to ensure real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found && JSON.stringify(found) !== JSON.stringify(playlist)) {
          // Check completed videos in localStorage to ensure progress is maintained
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }
    }, 1000); // Poll every second

    return () => {
      clearInterval(pollInterval);
    };
  }, [id, playlist]);

  // Update the loadPlaylistData function in the first useEffect
  useEffect(() => {
    const loadPlaylistData = async () => {
      setIsLoading(true);
      try {
        // First try to get playlist from navigation state
        const statePlaylist = location.state?.playlist as Playlist | undefined;
        if (statePlaylist) {
          // Check completed videos in localStorage to ensure progress is maintained
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = statePlaylist.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...statePlaylist, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
          
          // Update localStorage to maintain consistency
          const savedPlaylists = localStorage.getItem('youtubePlaylists');
          if (savedPlaylists) {
            const playlists: Playlist[] = JSON.parse(savedPlaylists);
            const index = playlists.findIndex(p => p.id === id);
            if (index !== -1) {
              playlists[index] = updatedPlaylist;
              localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
            }
          }
          
          setIsLoading(false);
          return;
        }

        // Fall back to localStorage if no state data
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const found = playlists.find(p => p.id === id);
          if (found) {
            // Check completed videos in localStorage to ensure progress is maintained
            const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
            const updatedVideos = found.videos.map(video => {
              const completedVideo = completedVideos.find(cv => cv.id === video.id);
              if (completedVideo) {
                return { ...video, progress: 100 };
              }
              return video;
            });
            const updatedPlaylist = { ...found, videos: updatedVideos };
            setPlaylist(updatedPlaylist);
            // Save to state to prevent loss on refresh
            window.history.replaceState(
              { playlist: updatedPlaylist },
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

  // Add a new effect to sync with completed videos
  useEffect(() => {
    if (!playlist) return;

    const syncCompletedVideos = () => {
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
      const updatedVideos = playlist.videos.map(video => {
        const completedVideo = completedVideos.find(cv => cv.id === video.id);
        if (completedVideo) {
          return { ...video, progress: 100 };
        }
        return video;
      });

      // Only update if there are changes
      if (JSON.stringify(updatedVideos) !== JSON.stringify(playlist.videos)) {
        const updatedPlaylist = { ...playlist, videos: updatedVideos };
        setPlaylist(updatedPlaylist);
        
        // Update localStorage
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const index = playlists.findIndex(p => p.id === id);
          if (index !== -1) {
            playlists[index] = updatedPlaylist;
            localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
          }
        }
      }
    };

    // Initial sync
    syncCompletedVideos();

    // Listen for changes to completedVideos
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'completedVideos') {
        syncCompletedVideos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [playlist, id]);

  // Add this effect to handle localStorage sync and auto-refresh
  useEffect(() => {
    if (!currentVideo) return;

    // Load initial data from localStorage
    const loadWatchData = () => {
      const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as WatchTimeData;
          setWatchTimeData(parsedData);
        } catch (e) {
          console.error('Error loading watch time data:', e);
        }
      }
    };

    // Initial load
    loadWatchData();

    // Set up polling interval for auto-refresh
    const pollInterval = setInterval(loadWatchData, 1000);

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `watchTime_${currentVideo.id}`) {
        loadWatchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentVideo?.id]);

  // Function to start tracking watch time
  const startWatchTimeTracking = () => {
    if (!playerRef.current || !currentVideo) return;

    const now = Date.now();
    lastUpdateTime.current = now;

    // Load existing watch time data
    const savedData = localStorage.getItem(`watchTime_${currentVideo.id}`);
    let existingData: WatchTimeData | null = null;
    if (savedData) {
      try {
        existingData = JSON.parse(savedData);
      } catch (e) {
        console.error('Error loading watch time data:', e);
      }
    }

    // Start the update interval
    updateInterval.current = setInterval(() => {
      if (!playerRef.current || !currentVideo) return;

      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - lastUpdateTime.current) / 1000) * 1000; // Round to nearest second
      lastUpdateTime.current = currentTime;

      // Update watch time data
      setWatchTimeData(prev => {
        const updatedData = {
          ...prev,
          totalWatchTime: prev.totalWatchTime + elapsed,
          lastUpdate: currentTime,
          cumulativeTime: prev.cumulativeTime + elapsed
        };

        // Save to localStorage
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(updatedData));
        return updatedData;
      });
    }, 1000);

    // Increment play count and initialize cumulative time if needed
    setWatchTimeData(prev => {
      const updatedData = {
        ...prev,
        playCount: prev.playCount + 1,
        cumulativeTime: existingData?.cumulativeTime || prev.cumulativeTime
      };

      // Save to localStorage
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Function to stop tracking watch time
  const stopWatchTimeTracking = () => {
    if (!currentVideo) return;

    const now = Date.now();

    // Clear the update interval
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }

    // Update and save to localStorage
    setWatchTimeData(prev => {
      const finalData = {
        ...prev,
        lastUpdate: now,
        stopCount: prev.stopCount + 1
      };

      // Save to localStorage
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(finalData));
      return finalData;
    });
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
    
    // Get the target video
    const targetVideo = playlist?.videos[index];
    if (!targetVideo) return;

    // Check if the target video is completed
    if (targetVideo.progress >= 100) {
      toast.info('This video is already completed');
      return;
    }

    // Stop current video playback
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    // Update URL without triggering a full navigation
    const newUrl = `/playlist/${id}/play?video=${index}`;
    window.history.pushState({}, '', newUrl);
    
    // Update state
    setCurrentVideoIndex(index);
    
    // Force player reinitialization
    setIsPlayerReady(false);
    setTimeout(() => {
      setIsPlayerReady(true);
    }, 100);
    
    toast.success(`Now playing: ${targetVideo.title}`);
  };

  const goToNextVideo = () => {
    if (playlist && currentVideoIndex < playlist.videos.length - 1) {
      // Find the next uncompleted video
      const nextUncompletedIndex = playlist.videos.findIndex((v, i) => i > currentVideoIndex && v.progress < 100);
      if (nextUncompletedIndex !== -1) {
        selectVideo(nextUncompletedIndex);
      } else {
        toast.info('No more uncompleted videos available');
      }
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      // Find the previous uncompleted video
      const prevUncompletedIndex = [...playlist?.videos || []]
        .reverse()
        .findIndex((v, i) => playlist.videos.length - 1 - i < currentVideoIndex && v.progress < 100);
      
      if (prevUncompletedIndex !== -1) {
        const actualIndex = playlist.videos.length - 1 - prevUncompletedIndex;
        selectVideo(actualIndex);
      } else {
        toast.info('No previous uncompleted videos available');
      }
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

      // Update localStorage for playlists
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

      // Store completed video in localStorage
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
      const videoToStore: CompletedVideo = {
        id: currentVideo.id,
        title: currentVideo.title,
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        completedAt: new Date().toISOString(),
        watchTime: watchTimeData.cumulativeTime
      };

      // Check if video is already in completed list
      const existingIndex = completedVideos.findIndex((v: CompletedVideo) => v.id === currentVideo.id);
      if (existingIndex === -1) {
        completedVideos.push(videoToStore);
        localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
      }

      // Reset watch time data for the completed video
      localStorage.removeItem(`watchTime_${currentVideo.id}`);
      setWatchTimeData({
        totalWatchTime: 0,
        lastPosition: 0,
        lastUpdate: Date.now(),
        playCount: 0,
        stopCount: 0,
        cumulativeTime: 0
      });

      // Update state with the new playlist
      setPlaylist(updatedPlaylist);

      // Check if this was the last uncompleted video
      const remainingUncompleted = updatedVideos.filter(v => v.progress < 100).length;
      
      // Stop the current video
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Reset player ready state
      setIsPlayerReady(false);

      // Show completion dialog if this was the last video
      if (remainingUncompleted === 0) {
        setShowCompletionDialog(true);
      } else {
        // Find and play the next uncompleted video
        const nextUncompletedIndex = updatedVideos.findIndex(v => v.progress < 100);
        if (nextUncompletedIndex !== -1) {
          selectVideo(nextUncompletedIndex);
        }
      }

      toast.success('Video marked as complete!');
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

  // Update the player initialization to handle play/stop counts
  useEffect(() => {
    let playerInstance: YouTubePlayer | null = null;
    let lastState: number | null = null;

    const initializePlayer = () => {
      if (!isPlayerReady || !iframeRef.current || !playlist) {
        return;
      }

      const currentVideo = playlist.videos[currentVideoIndex];
      if (!currentVideo) {
        return;
      }

      // Don't initialize if the video is completed
      if (currentVideo.progress >= 100) {
        toast.info('This video is already completed');
        // Find the first uncompleted video
        const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (firstUncompletedIndex !== -1) {
          selectVideo(firstUncompletedIndex);
        } else {
          setShowCompletionDialog(true);
        }
        return;
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
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
            enablejsapi: 1,
            widget_referrer: window.location.href
          } as YouTubePlayerVars,
          events: {
            onStateChange: (event: YouTubePlayerEvent) => {
              if (currentVideo.progress >= 100) {
                if (playerRef.current) {
                  playerRef.current.pauseVideo();
                }
                return;
              }

              // Only trigger play/stop when state actually changes
              if (event.data !== lastState) {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  startWatchTimeTracking();
                } else if (event.data === window.YT.PlayerState.PAUSED || 
                           event.data === window.YT.PlayerState.ENDED) {
                  stopWatchTimeTracking();
                }
                lastState = event.data;
              }
            },
            onReady: (event: YouTubePlayerEvent) => {
              playerRef.current = playerInstance;
              const videoData = event.target.getVideoData();
              setVideoTitle(videoData.title);
              
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
                // If somehow we got here with a completed video, find an uncompleted one
                const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
                if (firstUncompletedIndex !== -1) {
                  selectVideo(firstUncompletedIndex);
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
              // Try to find another uncompleted video on error
              const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
              if (firstUncompletedIndex !== -1 && firstUncompletedIndex !== currentVideoIndex) {
                selectVideo(firstUncompletedIndex);
              }
            }
          } as YouTubePlayerEvents
        };

        playerInstance = new window.YT.Player(iframeRef.current, playerOptions);
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        toast.error('Failed to initialize video player. Please try again.');
        // Try to find another uncompleted video on error
        const firstUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (firstUncompletedIndex !== -1 && firstUncompletedIndex !== currentVideoIndex) {
          selectVideo(firstUncompletedIndex);
        }
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
  }, [isPlayerReady, playlist, currentVideoIndex]);

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

  // Add an effect to handle video completion transitions
  useEffect(() => {
    if (playlist) {
      const currentVideo = playlist.videos[currentVideoIndex];
      if (currentVideo?.progress >= 100) {
        // Find the next uncompleted video
        const nextUncompletedIndex = playlist.videos.findIndex(v => v.progress < 100);
        if (nextUncompletedIndex !== -1) {
          selectVideo(nextUncompletedIndex);
        }
      }
    }
  }, [playlist?.videos.map(v => v.progress)]); // Watch for progress changes

  // Add this effect to handle page changes
  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (currentVideo) {
        // Save watch time data
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(watchTimeData));
        
        // If video is completed, ensure it's in the completed list
        if (currentVideo.progress >= 100) {
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const existingIndex = completedVideos.findIndex((v: CompletedVideo) => v.id === currentVideo.id);
          
          if (existingIndex === -1) {
            const videoToStore: CompletedVideo = {
              id: currentVideo.id,
              title: currentVideo.title,
              playlistId: playlist?.id || '',
              playlistTitle: playlist?.title || '',
              completedAt: new Date().toISOString(),
              watchTime: watchTimeData.cumulativeTime
            };
            completedVideos.push(videoToStore);
            localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
          }
        }
      }
    };
  }, [currentVideo, watchTimeData, playlist]);

  // Add a comprehensive refresh effect
  useEffect(() => {
    const refreshAllData = () => {
      // Refresh playlist data
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found) {
          // Check completed videos
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }

      // Refresh watch time data for current video
      if (currentVideo) {
        const savedWatchTime = localStorage.getItem(`watchTime_${currentVideo.id}`);
        if (savedWatchTime) {
          try {
            const watchData = JSON.parse(savedWatchTime) as WatchTimeData;
            setWatchTimeData(watchData);
          } catch (e) {
            console.error('Error loading watch time data:', e);
          }
        }
      }
    };

    // Initial refresh
    refreshAllData();

    // Set up polling interval
    const pollInterval = setInterval(refreshAllData, 1000);

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'youtubePlaylists' || e.key === 'completedVideos' || e.key?.startsWith('watchTime_')) {
        refreshAllData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id, currentVideo?.id]);

  // Add a visibility change handler to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh all data when tab becomes visible
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const playlists: Playlist[] = JSON.parse(savedPlaylists);
          const found = playlists.find(p => p.id === id);
          if (found) {
            const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
            const updatedVideos = found.videos.map(video => {
              const completedVideo = completedVideos.find(cv => cv.id === video.id);
              if (completedVideo) {
                return { ...video, progress: 100 };
              }
              return video;
            });
            const updatedPlaylist = { ...found, videos: updatedVideos };
            setPlaylist(updatedPlaylist);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  // Add a focus handler to refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      // Refresh all data when window regains focus
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const found = playlists.find(p => p.id === id);
        if (found) {
          const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
          const updatedVideos = found.videos.map(video => {
            const completedVideo = completedVideos.find(cv => cv.id === video.id);
            if (completedVideo) {
              return { ...video, progress: 100 };
            }
            return video;
          });
          const updatedPlaylist = { ...found, videos: updatedVideos };
          setPlaylist(updatedPlaylist);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

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

  // Update the formatTimeWithPrecision function to show only seconds
  const formatTimeWithPrecision = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
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
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {formatTimeWithPrecision(watchTimeData.cumulativeTime)}
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
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-blue-100/50 dark:border-blue-800/50">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Watch Stats</div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/50">
                              Played: {watchTimeData.playCount} times
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/50">
                              Stopped: {watchTimeData.stopCount} times
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  <div className="space-y-3 transition-all duration-500">
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
                <div className="space-y-3 transition-all duration-500">
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
