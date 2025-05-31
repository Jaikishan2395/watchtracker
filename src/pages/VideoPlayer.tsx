import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle, RotateCcw, Timer, ChevronLeft, Send, Mic, Smile, Search, ThumbsUp, Heart, Star, Flag, MoreVertical, Pin, Trash2, MessageSquare, StickyNote, Save, Edit2, X, Image, Download, FileText, Tag, Volume2, Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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

// Add SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    YT: YouTubeAPI;
    onYouTubeIframeAPIReady: () => void;
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
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

// Update ChatMessage interface
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'text' | 'audio' | 'emoji' | 'timestamp';
  audioUrl?: string;
  videoId?: string;
  videoTimestamp?: number;
  reactions: {
    [key: string]: string[]; // emoji: userIds
  };
  isPinned?: boolean;
}

interface Note {
  id: string;
  content: string;
  timestamp: number;
  videoId: string;
  videoTitle: string;
  isEditing?: boolean;
  images?: string[];
  tags?: string[];
  color?: string;
  flashcards?: Flashcard[];
  isFloating?: boolean;
  position?: { x: number; y: number };
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  noteId: string;
  lastReviewed: number;
  reviewCount: number;
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

@keyframes fade-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateX(10px) scale(0.95);
  }
  100% {
    opacity: 0;
    transform: translateX(20px) scale(0.9);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.3);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.5);
}
`;

// Add this after the styles declaration
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add SpeechRecognition event types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messageTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [deletingMessages, setDeletingMessages] = useState<Set<string>>(new Set());
  const [shakingMessages, setShakingMessages] = useState<Set<string>>(new Set());

  const [showChat, setShowChat] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(`notes_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteColor, setNoteColor] = useState<string>('#ffffff');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add state for note popup
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingInPopup, setIsEditingInPopup] = useState(false);
  const [popupNoteContent, setPopupNoteContent] = useState('');
  const [popupNoteImages, setPopupNoteImages] = useState<string[]>([]);
  const [popupNoteTags, setPopupNoteTags] = useState<string[]>([]);
  const [popupNoteColor, setPopupNoteColor] = useState('#ffffff');

  // New state variables for enhanced features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [floatingNotes, setFloatingNotes] = useState<Note[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  // Save chat messages to localStorage
  useEffect(() => {
    localStorage.setItem(`chat_${id}`, JSON.stringify(chatMessages));
  }, [chatMessages, id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

        // If current video is completed, find and play the next uncompleted video
        const currentVideo = updatedPlaylist.videos[currentVideoIndex];
        if (currentVideo?.progress >= 100) {
          const nextUncompletedIndex = updatedPlaylist.videos.findIndex(v => v.progress < 100);
          if (nextUncompletedIndex !== -1) {
            selectVideo(nextUncompletedIndex);
          }
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
    if (index === currentVideoIndex) {
      // If clicking the same video, toggle play/pause
      if (playerRef.current) {
        const state = playerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      }
      return;
    }
    
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

      // Dispatch playlist update event
      window.dispatchEvent(new CustomEvent('playlistUpdated', {
        detail: {
          playlistId: id,
          updatedPlaylist
        }
      }));

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
            autoplay: 0,
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

  // Function to add message with auto-delete
  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
    
    // Set timeout to delete message after 6 seconds
    const timeout = setTimeout(() => {
      // Start shake animation
      setShakingMessages(prev => new Set([...prev, message.id]));
      
      // After shake, start fade out
      setTimeout(() => {
        setShakingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(message.id);
          return newSet;
        });
        setDeletingMessages(prev => new Set([...prev, message.id]));
        
        // Remove message after fade out
        setTimeout(() => {
          setChatMessages(prev => prev.filter(msg => msg.id !== message.id));
          setDeletingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.id);
            return newSet;
          });
          delete messageTimeouts.current[message.id];
        }, 600); // Wait for fade-out animation to complete
      }, 300); // Wait for shake animation to complete
    }, 6000); // Changed from 15000 to 6000 (6 seconds)

    messageTimeouts.current[message.id] = timeout;
  };

  // Function to manually delete message
  const deleteMessage = (messageId: string) => {
    // Start shake animation
    setShakingMessages(prev => new Set([...prev, messageId]));
    
    if (messageTimeouts.current[messageId]) {
      clearTimeout(messageTimeouts.current[messageId]);
      delete messageTimeouts.current[messageId];
    }

    // After shake, start fade out
    setTimeout(() => {
      setShakingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      setDeletingMessages(prev => new Set([...prev, messageId]));
      
      // Remove message after fade out
      setTimeout(() => {
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        setDeletingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }, 600); // Wait for fade-out animation to complete
    }, 300); // Wait for shake animation to complete
    
    setShowMessageMenu(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'user1',
      username: 'User',
      content: newMessage,
      timestamp: Date.now(),
      type: 'text',
      reactions: {}
    };

    addMessage(message);
    setNewMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const message: ChatMessage = {
          id: Date.now().toString(),
          userId: 'user1',
          username: 'User',
          content: 'Audio message',
          timestamp: Date.now(),
          type: 'audio',
          audioUrl,
          reactions: {}
        };

        addMessage(message);
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check your permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (!reactions[emoji].includes('user1')) {
          reactions[emoji].push('user1');
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
    setShowReactions(null);
  };

  const togglePinMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, isPinned: !msg.isPinned };
      }
      return msg;
    }));
    setShowMessageMenu(null);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return chatMessages.filter(msg => msg.type !== 'timestamp');
    return chatMessages.filter(msg => 
      msg.type !== 'timestamp' && (
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [chatMessages, searchQuery]);

  const pinnedMessages = useMemo(() => 
    chatMessages.filter(msg => msg.isPinned && msg.type !== 'timestamp'),
    [chatMessages]
  );

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(`notes_${id}`, JSON.stringify(notes));
  }, [notes, id]);

  // Function to compress image
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to base64 with reduced quality
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve('');
          }
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Enhanced image upload handler with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    setNoteImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update addNote function
  const addNote = () => {
    if (!currentNote.trim() && noteImages.length === 0 || !currentVideo) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: Date.now(),
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      images: noteImages,
      tags: noteTags,
      color: noteColor
    };

    setNotes(prev => [...prev, newNote]);
    setCurrentNote('');
    setNoteImages([]);
    setNoteTags([]);
    setNoteColor('#ffffff');
    toast.success('Note saved!');
  };

  // Update editNote function
  const editNote = (noteId: string) => {
    setEditingNoteId(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setCurrentNote(note.content);
      setNoteImages(note.images || []);
      setNoteTags(note.tags || []);
      setNoteColor(note.color || '#ffffff');
    }
  };

  // Update saveEditedNote function
  const saveEditedNote = () => {
    if (!editingNoteId || (!currentNote.trim() && noteImages.length === 0)) return;

    setNotes(prev => prev.map(note => 
      note.id === editingNoteId 
        ? { 
            ...note, 
            content: currentNote,
            images: noteImages,
            tags: noteTags,
            color: noteColor
          }
        : note
    ));
    setEditingNoteId(null);
    setCurrentNote('');
    setNoteImages([]);
    setNoteTags([]);
    setNoteColor('#ffffff');
    toast.success('Note updated!');
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted!');
  };

  // Toggle between chat and notes
  const toggleSection = (section: 'chat' | 'notes') => {
    if (section === 'chat') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  };

  // Add paste image handler
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setIsUploading(true);
          try {
            const compressedImage = await compressImage(file);
            setNoteImages(prev => [...prev, compressedImage]);
            toast.success('Image pasted successfully!');
          } catch (error) {
            toast.error('Failed to paste image');
            console.error('Image paste error:', error);
          } finally {
            setIsUploading(false);
          }
        }
      }
    }
  };

  // Function to open note popup
  const openNotePopup = (note: Note) => {
    setSelectedNote(note);
    setPopupNoteContent(note.content);
    setPopupNoteImages(note.images || []);
    setPopupNoteTags(note.tags || []);
    setPopupNoteColor(note.color || '#ffffff');
    setShowNotePopup(true);
    setIsEditingInPopup(false);
  };

  // Function to start editing in popup
  const startEditingInPopup = (note: Note) => {
    setSelectedNote(note);
    setPopupNoteContent(note.content);
    setPopupNoteImages(note.images || []);
    setPopupNoteTags(note.tags || []);
    setPopupNoteColor(note.color || '#ffffff');
    setIsEditingInPopup(true);
    setShowNotePopup(true);
  };

  // Function to save edited note from popup
  const saveEditedNoteFromPopup = () => {
    if (!selectedNote || (!popupNoteContent.trim() && popupNoteImages.length === 0)) return;

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id 
        ? { 
            ...note, 
            content: popupNoteContent,
            images: popupNoteImages,
            tags: popupNoteTags,
            color: popupNoteColor
          }
        : note
    ));
    
    setIsEditingInPopup(false);
    setPopupNoteContent('');
    setPopupNoteImages([]);
    setPopupNoteTags([]);
    setPopupNoteColor('#ffffff');
    toast.success('Note updated!');
  };

  // Function to handle image upload in popup
  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedImage = await compressImage(file);
        uploadedUrls.push(compressedImage);
      }
      setPopupNoteImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to remove image in popup
  const removePopupImage = (index: number) => {
    setPopupNoteImages(prev => prev.filter((_, i) => i !== index));
  };

  // Function to add tag in popup
  const addPopupTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
    if (!popupNoteTags.includes(tag)) {
      setPopupNoteTags(prev => [...prev, tag]);
    }
  };

  // Function to remove tag in popup
  const removePopupTag = (tag: string) => {
    setPopupNoteTags(prev => prev.filter(t => t !== tag));
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Function to start voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll simulate it with a timeout
          toast.info('Converting speech to text...');
          setTimeout(() => {
            setCurrentNote(prev => prev + ' [Voice note transcribed] ');
            toast.success('Voice note converted to text!');
          }, 2000);
        } catch (error) {
          toast.error('Failed to convert voice note');
        }
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      toast.success('Voice recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  // Function to stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      toast.success('Voice recording stopped');
    }
  };

  // Function to add a tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Function to remove a tag
  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Function to toggle floating note
  const toggleFloatingNote = (note: Note) => {
    setNotes(prev => prev.map(n => 
      n.id === note.id 
        ? { ...n, isFloating: !n.isFloating, position: n.isFloating ? undefined : { x: 100, y: 100 } }
        : n
    ));
  };

  // Function to move floating note
  const moveFloatingNote = (noteId: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => 
      n.id === noteId 
        ? { ...n, position: { x, y } }
        : n
    ));
  };

  // Function to generate flashcards from note
  const generateFlashcards = (note: Note) => {
    const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const flashcards: Flashcard[] = sentences.map((sentence, index) => ({
      id: `${note.id}_flashcard_${index}`,
      front: sentence.trim(),
      back: 'Your answer here',
      noteId: note.id,
      lastReviewed: Date.now(),
      reviewCount: 0
    }));

    setNotes(prev => prev.map(n => 
      n.id === note.id 
        ? { ...n, flashcards }
        : n
    ));
  };

  // Function to export note as PDF
  const exportNoteAsPDF = async (note: Note) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export notes');
        return;
      }

      // Write the content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>${note.videoTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              p { font-size: 16px; margin-bottom: 20px; }
              img { max-width: 100%; margin: 10px 0; }
              .tag { background: #eee; padding: 5px 10px; margin: 5px; border-radius: 15px; display: inline-block; }
              .timestamp { font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${note.videoTitle}</h1>
            <p>${note.content}</p>
            ${note.images?.map(img => `<img src="${img}" />`).join('') || ''}
            ${note.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
            <p class="timestamp">Created: ${new Date(note.timestamp).toLocaleString()}</p>
          </body>
        </html>
      `);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Print the window
      printWindow.print();
      printWindow.close();
      
      toast.success('Note exported successfully!');
    } catch (error) {
      toast.error('Failed to export note');
      console.error('Export error:', error);
    }
  };

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
        {/* Enhanced Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {playlist && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Playlist
                </Button>
              )}
              <div className="text-2xl font-bold text-gray-800 dark:text-white">WatchMap</div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-slate-300">
              Video {currentVideoIndex + 1} of {playlist.videos.length}
            </p>
            
                <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Overall Progress: {Math.round(totalProgress)}%</span>
                  </div>
              </div>
            </div>

              <Button
                variant="outline"
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <List className="w-4 h-4 mr-2" />
                {showAllVideos ? 'Hide Playlist' : 'Show Playlist'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Video Player Section */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-black">
                  <div ref={iframeRef} className="w-full h-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Info */}
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
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={markAsComplete}
                          className={`transition-all duration-200 shadow-sm hover:shadow-md ${
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Toggle Buttons */}
            <div className="fixed bottom-8 right-8 flex gap-4 z-50">
              <Button
                onClick={() => toggleSection('chat')}
                className={`rounded-full shadow-lg transition-all duration-300 ${
                  showChat 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => toggleSection('notes')}
                className={`rounded-full shadow-lg transition-all duration-300 ${
                  !showChat 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200'
                }`}
              >
                <StickyNote className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Room or Notes Section */}
            <div className="xl:col-span-1">
              {showChat ? (
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
                  <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Chat
                      </CardTitle>
                      <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                        {chatMessages.length} messages
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Chat Messages */}
                    <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
                      {filteredMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">💬</div>
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex flex-col space-y-1 p-3 rounded-lg transition-all duration-200 ${
                              deletingMessages.has(message.id) 
                                ? 'animate-fade-out'
                                : shakingMessages.has(message.id)
                                ? 'animate-shake'
                                : 'animate-slide-in-right'
                            } ${
                              message.userId === 'user1'
                                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 ml-12'
                                : 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20 mr-12'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  message.userId === 'user1'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                    : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                                }`}>
                                  {message.username[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                                  {message.username}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowMessageMenu(showMessageMenu === message.id ? null : message.id)}
                                  className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-slate-700"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {message.type === 'text' && (
                              <p className="text-gray-800 dark:text-gray-100 pl-10">{message.content}</p>
                            )}
                            {message.type === 'audio' && message.audioUrl && (
                              <div className="pl-10">
                                <audio controls className="w-full rounded-lg">
                                  <source src={message.audioUrl} type="audio/webm" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}
                            {message.type === 'emoji' && (
                              <p className="text-2xl pl-10">{message.content}</p>
                            )}
                            
                            {/* Reactions */}
                            {Object.keys(message.reactions).length > 0 && (
                              <div className="flex gap-1 pl-10 mt-1">
                                {Object.entries(message.reactions).map(([emoji, users]) => (
                                  <div
                                    key={emoji}
                                    className="bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm"
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{users.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Message Menu */}
                            {showMessageMenu === message.id && (
                              <div className="absolute right-4 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 animate-fade-in">
                                <div className="p-1">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                    onClick={() => deleteMessage(message.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Message
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm"
                                    onClick={() => setShowReactions(message.id)}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-2" />
                                    Add Reaction
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Reaction Picker */}
                            {showReactions === message.id && (
                              <div className="absolute right-4 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 animate-fade-in">
                                <div className="p-2 grid grid-cols-4 gap-1">
                                  {['👍', '❤️', '😂', '🎉', '👏', '🙌', '🔥', '⭐'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addReaction(message.id, emoji)}
                                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 text-xl hover:scale-110"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-700/70 rounded-xl p-2 border border-gray-200 dark:border-slate-600">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 rounded-full hover:scale-105 transition-transform"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 dark:text-white"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`rounded-full transition-all duration-200 hover:scale-105 ${
                            isRecording 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/20 animate-pulse' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Recording Indicator */}
                      {isRecording && (
                        <div className="absolute -top-12 left-0 right-0 flex items-center justify-center animate-fade-in">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full flex items-center gap-3 shadow-lg shadow-red-500/20">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="font-medium">Recording...</span>
                          </div>
                        </div>
                      )}

                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-slate-700 animate-fade-in">
                          <div className="grid grid-cols-8 gap-2">
                            {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👏', '🙌', '😍', '🤔', '😎', '🎯', '💪', '✨', '🌟', '💫'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 text-xl hover:scale-110"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
                  <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl dark:text-white flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Video Notes
                      </CardTitle>
                      <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                        {notes.length} notes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Notes List */}
                      <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {notes.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              <div className="text-4xl mb-2">📝</div>
                              <p>No notes yet</p>
                              <p className="text-sm">Start taking notes!</p>
                            </div>
                          </div>
                        ) : (
                          notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                              style={{ backgroundColor: note.color }}
                              onClick={() => openNotePopup(note)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(note.timestamp).toLocaleString()}
                                  </span>
                                  {note.tags && note.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {note.tags.slice(0, 2).map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {note.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{note.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editNote(note.id);
                                    }}
                                    className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNote(note.id);
                                    }}
                                    className="h-6 w-6 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">{note.content}</p>
                              
                              {/* Display images if any */}
                              {note.images && note.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                  {note.images.slice(0, 2).map((image, index) => (
                                    <div key={index} className="relative group/image">
                                      <img
                                        src={image}
                                        alt={`Note image ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                      />
                                      {note.images && note.images.length > 2 && index === 1 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                          <span className="text-white text-sm">+{note.images.length - 2}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span className="truncate">{note.videoTitle}</span>
                                {note.flashcards && note.flashcards.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {note.flashcards.length} cards
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Note Input */}
                      <div className="relative mt-4">
                        <div 
                          className={`flex flex-col gap-2 bg-white/70 dark:bg-slate-700/70 rounded-xl p-4 border ${
                            isDragging ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-slate-600'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onPaste={handlePaste}
                        >
                          {/* Feature Buttons Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleDarkMode}
                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  >
                                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Toggle Dark Mode</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                                    className={`h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600 ${
                                      isRecordingVoice ? 'text-red-500 animate-pulse' : ''
                                    }`}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isRecordingVoice ? 'Stop Recording' : 'Start Voice Recording'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                      >
                                        <Tag className="w-4 h-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <Command>
                                        <CommandInput placeholder="Search or add tags..." />
                                        <CommandEmpty>No tags found.</CommandEmpty>
                                        <CommandGroup>
                                          {availableTags.map(tag => (
                                            <CommandItem
                                              key={tag}
                                              onSelect={() => addTag(tag)}
                                            >
                                              {tag}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add Tags</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleFloatingNote({ id: 'new', content: currentNote, timestamp: Date.now(), videoId: currentVideo?.id || '', videoTitle: currentVideo?.title || '' })}
                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  >
                                    <Maximize2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Create Floating Note</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => generateFlashcards({ id: 'new', content: currentNote, timestamp: Date.now(), videoId: currentVideo?.id || '', videoTitle: currentVideo?.title || '' })}
                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generate Flashcards</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => exportNoteAsPDF({ id: 'new', content: currentNote, timestamp: Date.now(), videoId: currentVideo?.id || '', videoTitle: currentVideo?.title || '' })}
                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Export as PDF</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <input
                                      type="color"
                                      value={noteColor}
                                      onChange={(e) => setNoteColor(e.target.value)}
                                      className="h-8 w-8 rounded cursor-pointer opacity-0 absolute inset-0"
                                    />
                                    <div 
                                      className="h-8 w-8 rounded cursor-pointer border border-gray-200 dark:border-slate-600"
                                      style={{ backgroundColor: noteColor }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Choose Note Color</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Selected Tags Display */}
                          {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedTags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTag(tag)}
                                    className="h-4 w-4 hover:bg-transparent"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Note Textarea */}
                          <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder={editingNoteId ? "Edit your note..." : "Take a note... (You can paste images here)"}
                            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[100px] text-gray-800 dark:text-gray-200"
                            style={{ backgroundColor: noteColor }}
                          />

                          {/* Image Upload and Send Button Row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                              />
                              <label htmlFor="image-upload">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white" />
                                  ) : (
                                    <Image className="w-4 h-4" />
                                  )}
                                </Button>
                              </label>
                            </div>

                            <div className="flex items-center gap-2">
                              {editingNoteId ? (
                                <>
                                  <Button
                                    onClick={saveEditedNote}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setEditingNoteId(null);
                                      setCurrentNote('');
                                      setNoteImages([]);
                                      setNoteTags([]);
                                      setNoteColor('#ffffff');
                                    }}
                                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full shadow-lg shadow-red-500/20 hover:scale-105 transition-transform"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={addNote}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Save Note
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Preview uploaded images */}
                        {noteImages.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {noteImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Uploaded image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setImagePreview(image)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 h-6 w-6 bg-red-500/80 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Navigation Controls */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousVideo}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                    className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
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
                    className="bg-white/70 hover:bg-white/90 dark:bg-slate-700/70 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Playlist Sidebar */}
          {showAllVideos && (
            <div className="space-y-4">
              {/* Uncompleted Videos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Uncompleted Videos</h3>
                  <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                    {uncompletedVideos.length}
                  </Badge>
                </div>
                {uncompletedVideos.length === 0 ? (
                  <div className="text-gray-600 dark:text-slate-400 text-sm">No uncompleted videos.</div>
                ) : (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      {uncompletedVideos.map((video) => {
                        const originalIndex = playlist?.videos.findIndex(v => v.id === video.id) ?? -1;
                        return (
                          <div
                            key={video.id}
                            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                              originalIndex === currentVideoIndex 
                                ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                                : ''
                            }`}
                            onClick={() => selectVideo(originalIndex)}
                          >
                            <img 
                              src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                              alt={`Video ${originalIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                    originalIndex === currentVideoIndex
                                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                      : 'bg-white/90 text-gray-700'
                                  }`}
                                >
                                  {originalIndex === currentVideoIndex ? (
                                    <Play className="w-4 h-4" />
                                  ) : (
                                    originalIndex + 1
                                  )}
                                </div>
                              </div>
                              {originalIndex === currentVideoIndex && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700">
                                    Now Playing
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Completed Videos */}
              {completedVideosList.length > 0 && (
                <div className="space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Completed Videos</h3>
                    <Badge variant="outline" className="bg-white/70 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600">
                      {completedVideosList.length}
                    </Badge>
                  </div>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      {completedVideosList.map((video) => {
                        const originalIndex = playlist?.videos.findIndex(v => v.id === video.id) ?? -1;
                        return (
                          <div
                            key={video.id}
                            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] opacity-70 hover:opacity-100 ${
                              originalIndex === currentVideoIndex ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                            }`}
                            onClick={() => selectVideo(originalIndex)}
                          >
                            <img 
                              src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                              alt={`Video ${originalIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                    video.progress >= 100 
                                      ? 'bg-green-600 dark:bg-green-700 text-white' 
                                      : originalIndex === currentVideoIndex
                                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                        : 'bg-white/90 text-gray-700'
                                  }`}
                                >
                                  {video.progress >= 100 ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : originalIndex === currentVideoIndex ? (
                                    <Play className="w-4 h-4" />
                                  ) : (
                                    originalIndex + 1
                                  )}
                                </div>
                              </div>
                              {originalIndex === currentVideoIndex && (
                                <div className="absolute top-2 right-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700">
                                    Now Playing
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Completion Dialog */}
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
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

      {/* Image preview modal */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 h-8 w-8 bg-white/20 text-white hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Note Popup */}
      {showNotePopup && selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative animate-fade-in">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowNotePopup(false);
                  setIsEditingInPopup(false);
                  setPopupNoteContent('');
                  setPopupNoteImages([]);
                  setPopupNoteTags([]);
                  setPopupNoteColor('#ffffff');
                }}
                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedNote.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {!isEditingInPopup ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingInPopup(selectedNote)}
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFloatingNote(selectedNote)}
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => exportNoteAsPDF(selectedNote)}
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generateFlashcards(selectedNote)}
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteNote(selectedNote.id);
                          setShowNotePopup(false);
                        }}
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEditedNoteFromPopup}
                        className="h-8 w-8 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingInPopup(false);
                          setPopupNoteContent('');
                          setPopupNoteImages([]);
                          setPopupNoteTags([]);
                          setPopupNoteColor('#ffffff');
                        }}
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingInPopup ? (
                <div className="space-y-4">
                  <textarea
                    value={popupNoteContent}
                    onChange={(e) => setPopupNoteContent(e.target.value)}
                    placeholder="Edit your note..."
                    className="w-full bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                    rows={5}
                  />
                  
                  {/* Voice-to-Text Button */}
                  <Button
                    variant="outline"
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                    className={`w-full ${isRecordingVoice ? 'bg-red-500 text-white' : ''}`}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isRecordingVoice ? 'Stop Recording' : 'Start Voice Recording'}
                  </Button>

                  {/* Tag Management */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {popupNoteTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePopupTag(tag)}
                            className="h-4 w-4 hover:bg-transparent"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Tag className="w-4 h-4 mr-2" />
                          Add Tag
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {availableTags.map(tag => (
                              <CommandItem
                                key={tag}
                                onSelect={() => addPopupTag(tag)}
                              >
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Image upload in popup */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePopupImageUpload}
                      className="hidden"
                      id="popup-image-upload"
                    />
                    <label htmlFor="popup-image-upload">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-600"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white" />
                        ) : (
                          <Image className="w-4 h-4" />
                        )}
                      </Button>
                    </label>

                    {/* Color picker in popup */}
                    <input
                      type="color"
                      value={popupNoteColor}
                      onChange={(e) => setPopupNoteColor(e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer"
                    />
                  </div>

                  {/* Preview uploaded images */}
                  {popupNoteImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {popupNoteImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Uploaded image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setImagePreview(image)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePopupImage(index)}
                            className="absolute top-2 right-2 h-6 w-6 bg-red-500/80 text-white hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>

                  {/* Display images if any */}
                  {selectedNote.images && selectedNote.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedNote.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Note image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setImagePreview(image)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display tags if any */}
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Display flashcards if any */}
                  {selectedNote.flashcards && selectedNote.flashcards.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
                      <div className="space-y-4">
                        {selectedNote.flashcards.map((flashcard) => (
                          <div
                            key={flashcard.id}
                            className="relative aspect-[2/1] cursor-pointer perspective-1000"
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <div
                              className={`absolute w-full h-full transition-transform duration-500 transform-style-3d ${
                                isFlipped ? 'rotate-y-180' : ''
                              }`}
                            >
                              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-700 rounded-lg p-4 shadow-lg">
                                <p className="text-lg font-medium">{flashcard.front}</p>
                              </div>
                              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-700 rounded-lg p-4 shadow-lg rotate-y-180">
                                <p className="text-lg font-medium">{flashcard.back}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedNote.videoTitle}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Notes */}
      {notes.filter(note => note.isFloating).map(note => (
        <div
          key={note.id}
          className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-80 z-50 cursor-move"
          style={{
            left: note.position?.x || 100,
            top: note.position?.y || 100,
          }}
          onMouseDown={(e) => {
            const startX = e.clientX - (note.position?.x || 0);
            const startY = e.clientY - (note.position?.y || 0);

            const handleMouseMove = (e: MouseEvent) => {
              moveFloatingNote(note.id, e.clientX - startX, e.clientY - startY);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{note.videoTitle}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFloatingNote(note)}
              className="h-6 w-6"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {note.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VideoPlayer;
