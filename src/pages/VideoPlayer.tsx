import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';

// Add YouTube API types
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

interface YouTubeAPI {
  Player: new (
    elementId: HTMLElement,
    options: {
      videoId: string;
      playerVars?: {
        autoplay?: number;
        controls?: number;
        modestbranding?: number;
        rel?: number;
        origin?: string;
        enablejsapi?: number;
      };
      events?: {
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onReady?: (event: YouTubePlayerEvent) => void;
        onError?: (event: YouTubePlayerEvent) => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
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

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const videoIndex = parseInt(searchParams.get('video') || '0');
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [watchTimeData, setWatchTimeData] = useState<WatchTimeData>({
    totalWatchTime: 0,
    lastPosition: 0,
    lastUpdate: Date.now(),
    sessions: []
  });
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Get current video from playlist
  const currentVideo = playlist?.videos[currentVideoIndex];

  // Load playlist data
  useEffect(() => {
    // First try to get playlist from navigation state
    const statePlaylist = location.state?.playlist as Playlist | undefined;
    if (statePlaylist) {
      setPlaylist(statePlaylist);
      return;
    }

    // Fall back to localStorage if no state data
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const found = playlists.find(p => p.id === id);
      if (found) {
        setPlaylist(found);
      }
    }
  }, [id, location.state]);

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
      if (currentVideo) {
        localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(watchTimeData));
      }
    };
  }, [currentVideo?.id, watchTimeData]);

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

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      navigate(`/playlist/${id}/play?video=${currentVideoIndex - 1}`);
    }
  };

  const goToNextVideo = () => {
    if (playlist && currentVideoIndex < playlist.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      navigate(`/playlist/${id}/play?video=${currentVideoIndex + 1}`);
      toast.success('Next video loaded!');
    }
  };

  const selectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    navigate(`/playlist/${id}/play?video=${index}`);
    toast.success(`Now playing: ${playlist?.videos[index].title}`);
  };

  const markAsComplete = () => {
    if (playlist && currentVideo) {
      updateVideoProgress(currentVideo.id, 100);
      toast.success(`"${currentVideo.title}" marked as complete!`);
    }
  };

  const markAllAsComplete = () => {
    if (!playlist) return;
    
    playlist.videos.forEach(video => {
      if (video.progress < 100) {
        updateVideoProgress(video.id, 100);
      }
    });
    toast.success('All videos marked as complete!');
  };

  const playNextUnwatched = () => {
    if (!playlist) return;
    
    const nextUnwatched = playlist.videos.findIndex((video, index) => 
      video.progress < 100 && index > currentVideoIndex
    );
    
    if (nextUnwatched !== -1) {
      selectVideo(nextUnwatched);
    } else {
      toast.info('All remaining videos are completed!');
    }
  };

  const resetAllData = () => {
    localStorage.removeItem('youtubePlaylists');
    toast.success('All data has been reset!');
    navigate('/');
  };

  // Load YouTube API
  useEffect(() => {
    console.log('Loading YouTube API...');
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
      }
    };
  }, []);

  // Update player initialization with new event handlers
  useEffect(() => {
    console.log('Player initialization effect running...', {
      isPlayerReady,
      hasIframeRef: !!iframeRef.current,
      hasPlaylist: !!playlist,
      currentVideoIndex,
      currentVideo: playlist?.videos[currentVideoIndex]
    });

    if (!isPlayerReady || !iframeRef.current || !playlist) {
      console.log('Player initialization skipped:', {
        isPlayerReady,
        hasIframeRef: !!iframeRef.current,
        hasPlaylist: !!playlist
      });
      return;
    }

    const currentVideo = playlist.videos[currentVideoIndex];
    if (!currentVideo) {
      console.log('No current video found');
      return;
    }

    // Improved video ID extraction
    let videoId = '';
    try {
      // Handle different YouTube URL formats
      const url = currentVideo.url.replace('@', ''); // Remove @ if present
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        // Direct video ID
        videoId = url;
      }
      
      console.log('Extracted video ID:', videoId, 'from URL:', url);
      
      if (!videoId) {
        console.error('Could not extract video ID from URL:', url);
        return;
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
      return;
    }

    try {
      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin, // Add origin for security
          enablejsapi: 1, // Enable JavaScript API
        },
        events: {
          onStateChange: (event: YouTubePlayerEvent) => {
            console.log('Player state changed:', event.data);
            if (event.data === window.YT.PlayerState.PLAYING) {
              startWatchTimeTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED || 
                       event.data === window.YT.PlayerState.ENDED) {
              stopWatchTimeTracking();
            }
          },
          onReady: (event: YouTubePlayerEvent) => {
            console.log('Player ready!');
            // Get video title when player is ready
            const videoData = event.target.getVideoData();
            setVideoTitle(videoData.title);
            
            // Resume from last position
            if (watchTimeData.lastPosition > 0) {
              playerRef.current?.seekTo(watchTimeData.lastPosition);
            }
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error('YouTube player error:', event.data);
            // Show user-friendly error message
            toast.error('Failed to load video. Please check the video URL and try again.');
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      toast.error('Failed to initialize video player. Please try again later.');
    }

    // Cleanup
    return () => {
      stopWatchTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isPlayerReady, playlist, currentVideoIndex]);

  // Reset watch time tracking when video changes
  useEffect(() => {
    stopWatchTimeTracking();
  }, [currentVideoIndex]);

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

  const uncompletedVideos = playlist.videos.filter(video => video.progress < 100);
  const completedVideosList = playlist.videos.filter(video => video.progress >= 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/playlist/${id}`)}
              className="hover:bg-white/50 dark:hover:bg-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Playlist
            </Button>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">WatchMap</div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="dark:text-white">Reset All Data</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-slate-300">
                    Are you sure you want to reset all data? This will permanently delete all playlists and their progress. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={resetAllData} 
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
                  >
                    Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{playlist.title}</h1>
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
              <Select
                value={currentVideoIndex.toString()}
                onValueChange={(value) => selectVideo(parseInt(value))}
              >
                <SelectTrigger className="w-80 bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-800 dark:border-slate-700">
                  {playlist.videos.map((video, index) => (
                    <SelectItem key={video.id} value={index.toString()} className="dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span className="truncate">{video.title}</span>
                        {video.progress >= 100 && (
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
              >
                <List className="w-4 h-4 mr-2" />
                {showAllVideos ? 'Hide' : 'Show'} All Videos
              </Button>

              <Button
                onClick={playNextUnwatched}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Next Unwatched
              </Button>

              <Button
                onClick={markAllAsComplete}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                Complete All
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

                  <div className="space-y-3">
                    <Progress value={currentVideo.progress} className="h-3 dark:bg-slate-700" />
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 25)}
                        disabled={currentVideo.progress >= 25}
                        className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 50)}
                        disabled={currentVideo.progress >= 50}
                        className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 75)}
                        disabled={currentVideo.progress >= 75}
                        className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600"
                      >
                        75%
                      </Button>
                      <Button
                        size="sm"
                        onClick={markAsComplete}
                        disabled={currentVideo.progress >= 100}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
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
                      <div className="text-right bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Current Position</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {formatTime(currentVideo.watchTime || 0)}
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
                uncompletedVideos.map((video, index) => (
                  <Card
                    key={video.id}
                    className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
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
                          <Progress value={video.progress} className="h-2 mt-2 dark:bg-slate-700" />
                          
                          {/* Quick action buttons */}
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-green-100 dark:hover:bg-green-900/30 dark:text-slate-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateVideoProgress(video.id, 100);
                              }}
                              disabled={video.progress >= 100}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateVideoProgress(video.id, 0);
                              }}
                              disabled={video.progress === 0}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Completed Videos */}
            {completedVideosList.length > 0 && (
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Completed Videos</h3>
                  <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                    {completedVideosList.length}
                  </Badge>
                </div>
                {completedVideosList.map((video, index) => (
                  <Card
                    key={video.id}
                    className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-200 hover:shadow-xl opacity-70 ${
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
                          <Progress value={video.progress} className="h-2 mt-2 dark:bg-slate-700" />
                          
                          {/* Quick action buttons */}
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-green-100 dark:hover:bg-green-900/30 dark:text-slate-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateVideoProgress(video.id, 100);
                              }}
                              disabled={video.progress >= 100}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateVideoProgress(video.id, 0);
                              }}
                              disabled={video.progress === 0}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
