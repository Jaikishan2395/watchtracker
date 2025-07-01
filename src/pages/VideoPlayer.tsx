import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle, RotateCcw, Timer, ChevronLeft, Send, Mic, Smile, Search, ThumbsUp, Heart, Star, Flag, MoreVertical, Pin, Trash2, MessageSquare, StickyNote, Save, Edit2, X, Image, Download, FileText, Tag, Volume2, Sun, Moon, Maximize2, Minimize2, Code, Video as VideoIcon, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video as PlaylistVideo } from '@/types/playlist';
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
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

// Update the YouTube API types at the top of the file
interface YouTubePlayer {
  destroy: () => void;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { title: string };
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setPlaybackQuality?: (quality: string) => void;
  getPlaybackQuality?: () => string;
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
  showinfo?: number;
  fs?: number;
  iv_load_policy?: number;
  disablekb?: number;
  playsinline?: number;
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
    adsbygoogle?: unknown[];
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
  }
  100% {
    opacity: 0;
  }
}

/* Disable YouTube hover effects */
iframe[src*="youtube.com"] {
  pointer-events: none !important;
}

.youtube-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.youtube-player-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none !important;
}

/* Hide YouTube's default controls and hover effects */
.youtube-player-container iframe {
  pointer-events: none !important;
}

/* Ensure our custom controls still work */
.video-controls {
  pointer-events: auto !important;
}

/* Custom Scrollbar Styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
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

// Add this constant at the top of the file after imports
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

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
  const updateInterval = useRef<number | null>(null);
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

  // Add new state variables for code IDE
  // Remove Code IDE interfaces and state
  // Remove: const [showFloatingCode, setShowFloatingCode] = useState(false);
  // Remove any JSX that renders the floating Code IDE window
  // Remove any interfaces, types, or comments specifically for the Code IDE

  // Add these state variables after the existing state declarations
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [showFloatingNotes, setShowFloatingNotes] = useState(false);
  const [chatWindowPosition, setChatWindowPosition] = useState({ x: 50, y: 50 });
  const [notesWindowPosition, setNotesWindowPosition] = useState({ x: 150, y: 50 });

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchInterval = useRef<NodeJS.Timeout | null>(null);

  const [volume, setVolume] = useState(100);

  // Extract video progress list for useMemo/useEffect dependencies
  const videoProgressList = useMemo(() => playlist?.videos.map(v => v.progress) || [], [playlist?.videos]);

  // Get current video from playlist
  const currentVideo = playlist?.videos[currentVideoIndex];

  // Wrap selectVideo in useCallback (move this above all useEffect hooks)
  const selectVideo = useCallback((index: number) => {
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
    
    // Reset stopwatch when changing videos
    stopStopwatch();
    setStopwatchTime(0);
    
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
  }, [currentVideoIndex, id, playlist, playerRef, setCurrentVideoIndex, setIsPlayerReady, toast]);

  // Move these useMemo declarations after selectVideo
  const uncompletedVideos = useMemo(() => 
    playlist?.videos.filter(video => video.progress < 100) || [],
    [playlist?.videos, videoProgressList]
  );

  const completedVideosList = useMemo(() => 
    playlist?.videos.filter(video => video.progress >= 100) || [],
    [playlist?.videos, videoProgressList]
  );

  // Wrap startWatchTimeTracking in useCallback
  const startWatchTimeTracking = useCallback(() => {
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
    updateInterval.current = window.setInterval(() => {
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
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(updatedData));
      return updatedData;
    });
  }, [currentVideo]);

  // Wrap stopWatchTimeTracking in useCallback
  const stopWatchTimeTracking = useCallback(() => {
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
      localStorage.setItem(`watchTime_${currentVideo.id}`, JSON.stringify(finalData));
      return finalData;
    });
  }, [currentVideo]);

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
        setPlaylist(updatedPlaylist);
        if (currentVideoIndex === playlist?.videos.length - 1) {
          setCurrentVideoIndex(updatedPlaylist.videos.length - 1);
        }
        const currentVideo = updatedPlaylist.videos[currentVideoIndex];
        if (currentVideo?.progress >= 100) {
          const nextUncompletedIndex = updatedPlaylist.videos.findIndex(v => v.progress < 100);
          if (nextUncompletedIndex !== -1) {
            selectVideo(nextUncompletedIndex);
          }
        }
      }
    };
    window.addEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);
    return () => {
      window.removeEventListener('playlistUpdated', handlePlaylistUpdate as EventListener);
    };
  }, [id, currentVideoIndex, playlist?.videos.length, selectVideo]);

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

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };

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

    // Remove from completedVideos if resetting
    if (progress < 100) {
      const completedVideos = JSON.parse(localStorage.getItem('completedVideos') || '[]') as CompletedVideo[];
      const newCompletedVideos = completedVideos.filter(v => v.id !== videoId);
      localStorage.setItem('completedVideos', JSON.stringify(newCompletedVideos));
    }

    // **Always update local state for instant UI update**
    setPlaylist(updatedPlaylist);

    toast.success('Progress updated!');
  };

  // Function to go to next video
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

  // Update the markAsComplete function
  const markAsComplete = () => {
    if (playlist && currentVideo) {
      stopStopwatch(); // Stop the stopwatch when marking as complete
      
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
            controls: 0, // Hide YouTube controls
            modestbranding: 1,
            rel: 0, // Disable recommended videos
            showinfo: 0,
            fs: 0,
            iv_load_policy: 3,
            disablekb: 1,
            playsinline: 1, // For mobile
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

  // Add these functions after the existing functions
  const startStopwatch = () => {
    if (!isStopwatchRunning) {
      setIsStopwatchRunning(true);
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopStopwatch = () => {
    if (isStopwatchRunning) {
      setIsStopwatchRunning(false);
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    }
  };

  // Add this effect to handle stopwatch cleanup
  useEffect(() => {
    return () => {
      if (stopwatchInterval.current) {
        clearInterval(stopwatchInterval.current);
      }
    };
  }, []);

  // --- Advertisement Popup State and Logic ---
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adPopupTimer, setAdPopupTimer] = useState(0); // seconds since popup appeared
  const [adPopupCanClose, setAdPopupCanClose] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const adTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to show the ad popup
  const showAd = useCallback(() => {
    setShowAdPopup(true);
    setAdPopupTimer(0);
    setAdPopupCanClose(false);
    setAdBlockDetected(false);
    // Auto-pause the video when the ad appears
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    // Start timer for the popup (for the counter display)
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    adTimerIntervalRef.current = setInterval(() => {
      setAdPopupTimer(prev => prev + 1);
    }, 1000);
    // After 20 seconds, allow closing
    if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
    adCloseTimeoutRef.current = setTimeout(() => {
      setAdPopupCanClose(true);
      if (adTimerIntervalRef.current) {
        clearInterval(adTimerIntervalRef.current);
      }
    }, 20000);
  }, []);

  // Effect to start the first ad after 10 seconds when player is ready
  useEffect(() => {
    if (!isPlayerReady) return;
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    adTimeoutRef.current = setTimeout(() => {
      showAd();
    }, 3600000);
    return () => {
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
      if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
      if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    };
  }, [isPlayerReady, showAd]);

  // When popup closes, start timer for next ad
  const handleCloseAdPopup = () => {
    setShowAdPopup(false);
    setAdPopupTimer(0);
    setAdPopupCanClose(false);
    if (adCloseTimeoutRef.current) clearTimeout(adCloseTimeoutRef.current);
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    // Start next ad after 10 seconds
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    adTimeoutRef.current = setTimeout(() => {
      showAd();
    }, 3600000);
  };

  useEffect(() => {
    if (showAdPopup) {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (!win.adsbygoogle && !document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        document.body.appendChild(script);
      }
      setTimeout(() => {
        try {
          (win.adsbygoogle = win.adsbygoogle || []).push({});
        } catch (e) {
          /* AdSense push failed, likely not loaded yet. */
        }
      }, 500);
    }
  }, [showAdPopup]);

  // Auto-close sidebar on mount
  const { setOpen, setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, [setOpen, setOpenMobile]);

  // Set initial volume on player ready
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [isPlayerReady]);

  const [isPlayerHovered, setIsPlayerHovered] = useState(false);

  // Add state for selected quality
  const [selectedQuality, setSelectedQuality] = useState('auto');

  // In the player initialization effect, after player is ready, set selectedQuality to current quality
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    try {
      const currentQuality = playerRef.current.getPlaybackQuality?.() || 'auto';
      setSelectedQuality(currentQuality);
    } catch (e) { /* ignore */ }
  }, [isPlayerReady]);

  // Add at the top with other useState imports
  const [isFormalizing, setIsFormalizing] = useState(false);

  // Add after other useState/useRef declarations in VideoPlayer
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen handlers
  const handleToggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (container as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
      } else if ((container as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        (container as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen!();
      }
    } else {
      const doc = document as Document & {
        webkitExitFullscreen?: () => void;
        msExitFullscreen?: () => void;
      };
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        msFullscreenElement?: Element;
      };
      const fullscreenElement = document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const [isFrozen, setIsFrozen] = useState(false);

  // Place these at the top of VideoPlayer component, after other useState/useRef
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatPos, setChatPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 432, y: window.innerHeight - 532 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setChatPos({
        x: Math.min(Math.max(e.clientX - dragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - dragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  // Add state for floating notes window position and dragging
  const notesRef = useRef<HTMLDivElement>(null);
  const [notesPos, setNotesPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 900, y: window.innerHeight - 532 });
  const [notesDragging, setNotesDragging] = useState(false);
  const [notesDragOffset, setNotesDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!notesDragging) return;
      setNotesPos({
        x: Math.min(Math.max(e.clientX - notesDragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - notesDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setNotesDragging(false);
    if (notesDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [notesDragging, notesDragOffset]);

  // Add state for Pomodoro
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroPos, setPomodoroPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 1350, y: window.innerHeight - 532 });
  const [pomodoroDragging, setPomodoroDragging] = useState(false);
  const [pomodoroDragOffset, setPomodoroDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isWork, setIsWork] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const pomodoroRef = useRef<HTMLDivElement>(null);
  const pomodoroInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomodoroRunning) {
      pomodoroInterval.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev > 0) return prev - 1;
          setIsWork(w => !w);
          return isWork ? breakDuration * 60 : workDuration * 60;
        });
      }, 1000);
    } else if (pomodoroInterval.current) {
      clearInterval(pomodoroInterval.current);
    }
    return () => {
      if (pomodoroInterval.current) clearInterval(pomodoroInterval.current);
    };
  }, [pomodoroRunning, isWork, workDuration, breakDuration]);

  useEffect(() => {
    if (isWork) setPomodoroTime(workDuration * 60);
    else setPomodoroTime(breakDuration * 60);
  }, [workDuration, breakDuration, isWork, showPomodoro]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pomodoroDragging) return;
      setPomodoroPos({
        x: Math.min(Math.max(e.clientX - pomodoroDragOffset.x, 0), window.innerWidth - 320),
        y: Math.min(Math.max(e.clientY - pomodoroDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setPomodoroDragging(false);
    if (pomodoroDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pomodoroDragging, pomodoroDragOffset]);

  function formatPomodoroTime(t: number) {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Add state for Ask AI popup
  const [showAskAI, setShowAskAI] = useState(false);
  const [askAIPos, setAskAIPos] = useState<{ x: number; y: number }>({ x: window.innerWidth - 900, y: window.innerHeight - 600 });
  const [askAIDragging, setAskAIDragging] = useState(false);
  const [askAIDragOffset, setAskAIDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiAnswer, setAIAnswer] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const askAIRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!askAIDragging) return;
      setAskAIPos({
        x: Math.min(Math.max(e.clientX - askAIDragOffset.x, 0), window.innerWidth - 400),
        y: Math.min(Math.max(e.clientY - askAIDragOffset.y, 0), window.innerHeight - 80),
      });
    };
    const handleMouseUp = () => setAskAIDragging(false);
    if (askAIDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [askAIDragging, askAIDragOffset]);

  // Fix Gemini API answer extraction
  async function handleAskAI() {
    if (!aiQuestion.trim()) return;
    setAILoading(true);
    setAIAnswer('');
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBwZB2vM8bFAY8sQ6nok5YoRlz2_zalQwo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiQuestion }] }]
        })
      });
      const data = await res.json();
      // Try to extract the answer from multiple possible locations
      let answer = '';
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        answer = data.candidates[0].content.parts[0].text;
      } else if (data?.candidates?.[0]?.content?.text) {
        answer = data.candidates[0].content.text;
      } else if (data?.candidates?.[0]?.output) {
        answer = data.candidates[0].output;
      } else if (data?.candidates?.[0]?.content) {
        answer = typeof data.candidates[0].content === 'string' ? data.candidates[0].content : JSON.stringify(data.candidates[0].content);
      } else if (data?.candidates?.[0]) {
        answer = JSON.stringify(data.candidates[0]);
      } else {
        answer = 'No answer received.';
      }
      setAIAnswer(answer);
    } catch (e) {
      setAIAnswer('Error contacting AI.');
    }
    setAILoading(false);
  }

  // Move this to the top of the VideoPlayer component, after other useRef/useState
  const videoListsRef = useRef<HTMLDivElement>(null);

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
      {/* Advertisement Popup Overlay */}
      {showAdPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
              borderRadius: '32px',
              boxShadow: '0 16px 64px rgba(0,0,0,0.30)',
              padding: '80px 64px',
              minWidth: '900px',
              minHeight: '600px',
              width: '70vw',
              height: '70vh',
              textAlign: 'center',
              position: 'relative',
              maxWidth: '98vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #2563eb',
            }}
          >
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#2563eb',
              marginBottom: 32,
              letterSpacing: '2px',
              textShadow: '0 2px 8px #2563eb22',
            }}>
              
            </div>
            <div
              style={{
                width: '1000px',
                height: '500px',
                maxWidth: '100%',
                maxHeight: '100%',
                marginBottom: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e0e7ef',
                borderRadius: 24,
                border: '2px solid #2563eb33',
                boxShadow: '0 4px 32px rgba(37,99,235,0.10)',
              }}
            >
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
                data-ad-slot="YYYYYYYYYYYY"
                data-ad-format="auto"
              />
            </div>
            {/* Timer/Close Button Area */}
            <div style={{ marginTop: 24 }}>
              {adPopupCanClose ? (
                <button
                  onClick={handleCloseAdPopup}
                  style={{
                    padding: '16px 48px',
                    background: 'linear-gradient(90deg, #2563eb 60%, #1e40af 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 16px rgba(37,99,235,0.15)',
                    transition: 'background 0.2s',
                    letterSpacing: '1px',
                  }}
                >
                  Close Advertisement
                </button>
              ) : (
                <div
                  style={{
                    fontSize: '1.3rem',
                    color: '#2563eb',
                    fontWeight: 600,
                    background: '#e0e7ef',
                    borderRadius: 12,
                    padding: '12px 32px',
                    display: 'inline-block',
                    boxShadow: '0 1px 8px #2563eb11',
                  }}
                >
                  Please wait... <b>{20 - adPopupTimer}</b> seconds
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
              {playlist && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="bg-black text-white rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 hover:bg-white hover:text-black hover:border-black flex items-center gap-2"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                >
              <ArrowLeft className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                  Back to Playlist
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowAllVideos(!showAllVideos);
                  if (!showAllVideos) {
                    setTimeout(() => {
                      videoListsRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
            className="bg-black text-white rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 hover:bg-white hover:text-black hover:border-black flex items-center gap-2"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          >
            <List className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
            {showAllVideos ? 'Hide' : 'Show'}
          </Button>
          <Button
            onClick={() => setShowAskAI(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold px-6 py-2 shadow-md border border-blue-600 transition-all duration-200 hover:bg-white hover:text-blue-600 hover:border-blue-600 flex items-center gap-2 ml-2"
            style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.10)' }}
          >
            Ask AI
              </Button>
            </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Video Player Section */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="relative bg-white/90 dark:bg-slate-900/90 shadow-2xl rounded-3xl border-0 overflow-visible animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardContent className="p-0 relative">
                <div
                  ref={videoContainerRef}
                  className={
                    `relative aspect-video w-full rounded-3xl overflow-hidden shadow-xl bg-black${isFullscreen ? ' z-[9999] bg-black' : ''}`
                  }
                  onMouseEnter={() => setIsPlayerHovered(true)}
                  onMouseLeave={() => setIsPlayerHovered(false)}
                  onClick={() => {
                    if (isFullscreen && isStopwatchRunning && playerRef.current) {
                      if (!isFrozen) {
                        playerRef.current.pauseVideo();
                        setIsFrozen(true);
                      } else {
                        setIsFrozen(false);
                        playerRef.current.playVideo();
                        startStopwatch();
                      }
                    }
                  }}
                >
                  {/* Video Iframe */}
                  <div ref={iframeRef} className="w-full h-full z-10" />
                  {/* Gradient overlay for controls */}
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />
                  {/* Central Play/Stop Button Overlay */}
                  {!isStopwatchRunning && currentVideo && (
                    <div
                      className="absolute inset-0 z-20 flex items-center justify-center bg-black cursor-pointer"
                      style={{ backgroundColor: '#000' }}
                      onClick={() => {
                        if (isFrozen) return;
                        if (playerRef.current) {
                          playerRef.current.playVideo();
                          startStopwatch();
                        }
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(currentVideo.url)}/maxresdefault.jpg`}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${extractVideoIdFromUrl(currentVideo.url)}/mqdefault.jpg`;
                        }}
                        alt="Video thumbnail"
                        className="object-cover w-full h-full rounded-3xl"
                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/80 hover:bg-white/90 rounded-full p-6 shadow-2xl border-4 border-blue-500/30 transition-all group-hover:scale-110">
                          <PlayCircle className="w-16 h-16 text-blue-600 drop-shadow-xl" />
                        </span>
                      </span>
                    </div>
                  )}
                  {/* Stop Button Overlay */}
                  {(isPlayerHovered && isStopwatchRunning && !isFullscreen) && (
                    <button
                      className="absolute inset-0 flex items-center justify-center z-40 group focus:outline-none"
                      onClick={() => {
                        if (playerRef.current) {
                          if (!isFrozen) {
                            playerRef.current.pauseVideo();
                            setIsFrozen(true);
                          } else {
                            setIsFrozen(false);
                            playerRef.current.playVideo();
                            startStopwatch();
                          }
                        }
                      }}
                      aria-label="Stop video"
                    >
                      <span className="bg-white/80 hover:bg-white/90 rounded-full p-6 shadow-2xl border-4 border-red-500/30 transition-all group-hover:scale-110">
                        <Timer className="w-16 h-16 text-red-600 drop-shadow-xl" />
                      </span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Info */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl dark:text-white">
                      {videoTitle || currentVideo.title}
                    </CardTitle>
                    <Button
                      variant={isFrozen ? 'destructive' : 'outline'}
                      size="icon"
                      onClick={() => {
                        if (!isFrozen) {
                          if (playerRef.current) playerRef.current.pauseVideo();
                          setIsFrozen(true);
                        } else {
                          setIsFrozen(false);
                          if (playerRef.current) {
                            playerRef.current.playVideo();
                            startStopwatch();
                          }
                        }
                      }}
                      title={isFrozen ? 'Unfreeze video' : 'Freeze video'}
                      className="ml-2"
                    >
                      {isFrozen ? <Play className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
                    </Button>
                  </div>
                  {currentVideo.progress >= 100 && (
                    <Badge className="bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700">
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Video Player Controls */}
                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="space-y-4">
                      {/* Main Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={markAsComplete}
                            className={`relative overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                              currentVideo.progress >= 100
                                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white'
                                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white'
                            }`}
                          >
                            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                            {currentVideo.progress >= 100 ? 'Completed' : 'Complete'}
                          </Button>
                          <div className="h-6 w-px bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
                          
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Quality, Volume and Speed Controls - Improved Design */}
                          <div className="flex items-center gap-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-blue-200 dark:border-blue-900/40 ring-1 ring-blue-100 dark:ring-blue-900/30" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.15)'}}> 
                            {/* Quality */}
                            <div className="flex items-center gap-2 group relative">
                              <div className="relative">
                                <button
                                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 font-bold shadow-md hover:scale-105 hover:shadow-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/60 transition-all duration-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                  title="Video Quality"
                                  tabIndex={0}
                                >
                                  <VideoIcon className="w-6 h-6" />
                              <select
                                id="video-quality"
                                    className="appearance-none bg-transparent border-none outline-none text-base font-bold cursor-pointer rounded-full px-2 py-1 focus:ring-2 focus:ring-yellow-400 transition-all"
                                value={selectedQuality}
                                onChange={e => {
                                  const quality = e.target.value;
                                  setSelectedQuality(quality);
                                  if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function') {
                                    playerRef.current.setPlaybackQuality(quality);
                                    setTimeout(() => {
                                      const actual = playerRef.current?.getPlaybackQuality?.() || quality;
                                      setSelectedQuality(actual);
                                      toast.success(`Video quality set to ${actual === 'auto' ? 'Auto' : actual.toUpperCase()}`);
                                    }, 500);
                                  }
                                }}
                              >
                                <option value="auto">Auto</option>
                                <option value="tiny">144p</option>
                                <option value="small">240p</option>
                                <option value="medium">360p</option>
                                <option value="large">480p</option>
                                <option value="hd720">720p</option>
                                <option value="hd1080">1080p</option>
                              </select>
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-200"><svg width="16" height="16" fill="currentColor"><path d="M4 6l4 4 4-4"/></svg></span>
                                </button>
                                <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-yellow-600 text-white text-xs rounded-lg px-3 py-1 shadow-lg transition-all duration-200 z-20">Change video quality</span>
                            </div>
                            </div>
                            {/* Volume */}
                            <div className="flex items-center gap-2 group relative">
                              <div className="relative">
                                <button
                                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold shadow-md hover:scale-105 hover:shadow-lg hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                  title="Volume"
                                  tabIndex={0}
                                >
                                  <Volume2 className="w-6 h-6" />
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={volume}
                                onChange={e => {
                                  const newVolume = Number(e.target.value);
                                  setVolume(newVolume);
                                  if (playerRef.current) {
                                    playerRef.current.setVolume(newVolume);
                                  }
                                }}
                                    className="w-28 accent-blue-500 cursor-pointer rounded-full bg-gray-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                title="Volume"
                              />
                                  <span className="ml-2 text-base font-bold text-blue-700 dark:text-blue-200 w-10 text-right">{volume}%</span>
                                </button>
                                <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-blue-700 text-white text-xs rounded-lg px-3 py-1 shadow-lg transition-all duration-200 z-20">Adjust volume</span>
                            </div>
                            </div>
                            {/* Speed */}
                            <div className="flex items-center gap-2 group relative">
                              <div className="relative">
                                <button
                                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 font-bold shadow-md hover:scale-105 hover:shadow-lg hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-all duration-200 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                  title="Playback Speed"
                                  tabIndex={0}
                                >
                                  <Code className="w-6 h-6" />
                              <select
                                id="playback-speed"
                                    className="appearance-none bg-transparent border-none outline-none text-base font-bold cursor-pointer rounded-full px-2 py-1 focus:ring-2 focus:ring-purple-400 transition-all"
                                defaultValue={1}
                                onChange={e => {
                                  const speed = Number(e.target.value);
                                  if (playerRef.current) {
                                    playerRef.current.setPlaybackRate(speed);
                                  }
                                }}
                              >
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                              </select>
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 dark:text-purple-200"><svg width="16" height="16" fill="currentColor"><path d="M4 6l4 4 4-4"/></svg></span>
                                </button>
                                <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-purple-700 text-white text-xs rounded-lg px-3 py-1 shadow-lg transition-all duration-200 z-20">Change playback speed</span>
                            </div>
                            </div>
                            {/* Fullscreen */}
                            <div className="relative group">
                              <button
                              onClick={handleToggleFullscreen}
                              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-extrabold shadow-lg hover:scale-110 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 group-hover:animate-none"
                                style={{ minWidth: 54 }}
                              >
                                {isFullscreen ? <Minimize2 className="w-7 h-7" /> : <Maximize2 className="w-7 h-7" />}
                                <span className="hidden sm:inline text-base">{isFullscreen ? 'Exit' : 'Full'} Screen</span>
                              </button>
                              <span className="absolute left-1/2 -bottom-10 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-blue-700 text-white text-xs rounded-lg px-3 py-1 shadow-lg transition-all duration-200 z-20">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress and Time Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress 
                            value={playerRef.current ? (playerRef.current.getCurrentTime() / (playerRef.current.getDuration() || 1)) * 100 : 0} 
                            className="h-2"
                            onClick={(e) => {
                              if (playerRef.current) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percentage = x / rect.width;
                                const duration = playerRef.current.getDuration();
                                playerRef.current.seekTo(duration * percentage);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="space-y-4">
                    {/* Feature Toggles */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setShowFloatingChat(!showFloatingChat)}
                        className={`rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <MessageSquare className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Chat Room
                      </Button>
                      <Button
                        onClick={() => setShowFloatingNotes(!showFloatingNotes)}
                        className={`rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <StickyNote className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Notes
                      </Button>
                      <Button
                        onClick={() => setShowPomodoro(!showPomodoro)}
                        className="rounded-full font-bold px-6 py-2 shadow-md border border-black transition-all duration-200 flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border-black"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      >
                        <Timer className="w-5 h-5 mr-2 transition-all duration-200 group-hover:text-black" />
                        Pomodoro
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Remove the sidebar video lists here */}
              </div>
        {/* Move the video lists to the bottom, horizontally */}
          <div ref={videoListsRef} />
          {showAllVideos && (
          <div className="mt-12">
            <div className="flex flex-col gap-8">
              {/* Uncompleted Videos Horizontal List */}
              {uncompletedVideos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Uncompleted Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {uncompletedVideos.map((video, index) => (
                      <div 
                        key={video.id} 
                        className="relative group cursor-pointer min-w-[220px] max-w-[220px]"
                        onClick={() => selectVideo(playlist.videos.indexOf(video))}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-blue-500" />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            {playlist.videos.indexOf(video) + 1}/{playlist.videos.length}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 font-medium truncate text-center">
                          {video.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Completed Videos Horizontal List */}
              {completedVideosList.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Completed Videos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {completedVideosList.map((video, index) => (
                      <div
                        key={video.id}
                        className="relative group cursor-pointer min-w-[220px] max-w-[220px]"
                        onClick={() => selectVideo(playlist.videos.indexOf(video))}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={`https://img.youtube.com/vi/${extractVideoIdFromUrl(video.url)}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-green-500" />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            {playlist.videos.indexOf(video) + 1}/{playlist.videos.length}
                          </div>
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
                            Completed
                          </div>
                          <button
                            className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10 hover:bg-red-700 transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                              updateVideoProgress(video.id, 0);
                              toast.success('Video reset to uncompleted status.');
                            }}
                          >
                            Reset
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 font-medium truncate text-center">
                          {video.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      {/* Floating Chat Window */}
      {showFloatingChat && (
        <div
          ref={chatRef}
          style={{
            position: 'fixed',
            left: chatPos.x,
            top: chatPos.y,
            width: 400,
            maxWidth: '90vw',
            height: 500,
            maxHeight: '80vh',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: dragging ? 'none' : 'auto',
            cursor: dragging ? 'grabbing' : 'default',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-t-2xl cursor-move select-none"
            onMouseDown={e => {
              setDragging(true);
              const rect = chatRef.current?.getBoundingClientRect();
              setDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg">Chat Room</span>
            <button
              onClick={() => setShowFloatingChat(false)}
              className="text-white hover:text-red-400 text-xl font-bold focus:outline-none"
              title="Close Chat"
            >
              ×
            </button>
      </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
            {/* Chat messages go here */}
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-center mt-16">No messages yet. Start the conversation!</div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="mb-3">
                  <div className="font-semibold text-sm text-gray-700">{msg.username}</div>
                  <div className="text-gray-800 bg-white rounded-lg px-3 py-2 shadow-sm inline-block">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
          <form
            className="flex items-center border-t border-gray-200 px-3 py-2 bg-white"
            onSubmit={e => {
              e.preventDefault();
              if (!newMessage.trim()) return;
              addMessage({
                id: Date.now().toString(),
                userId: 'user1',
                username: 'You',
                content: newMessage,
                timestamp: Date.now(),
                type: 'text',
                reactions: {},
              });
              setNewMessage('');
            }}
          >
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="bg-black text-white rounded-full px-4 py-2 font-bold hover:bg-gray-900 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
      {/* Floating Notes Window */}
      {showFloatingNotes && (
        <div
          ref={notesRef}
          style={{
            position: 'fixed',
            left: notesPos.x,
            top: notesPos.y,
            width: 400,
            maxWidth: '90vw',
            height: 500,
            maxHeight: '80vh',
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: notesDragging ? 'none' : 'auto',
            cursor: notesDragging ? 'grabbing' : 'default',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-t-2xl cursor-move select-none"
            onMouseDown={e => {
              setNotesDragging(true);
              const rect = notesRef.current?.getBoundingClientRect();
              setNotesDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg">Notes</span>
            <button
              onClick={() => setShowFloatingNotes(false)}
              className="text-white hover:text-red-400 text-xl font-bold focus:outline-none"
              title="Close Notes"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
            {notes.filter(n => n.videoId === currentVideo?.id).length === 0 ? (
              <div className="text-gray-400 text-center mt-16">No notes yet. Add your first note!</div>
            ) : (
              notes.filter(n => n.videoId === currentVideo?.id).map(note => (
                <div key={note.id} className="mb-4 p-3 bg-white rounded-lg shadow border border-gray-200 flex justify-between items-start">
                  <div>
                    <div className="text-gray-700 mb-1">{note.content}</div>
                    <div className="text-xs text-gray-400">{new Date(note.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Delete Note"
                    onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <form
            className="flex items-center border-t border-gray-200 px-3 py-2 bg-white"
            onSubmit={e => {
              e.preventDefault();
              if (!noteInput.trim() || !currentVideo) return;
              setNotes(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  content: noteInput,
                  timestamp: Date.now(),
                  videoId: currentVideo.id,
                  videoTitle: currentVideo.title,
                },
              ]);
              setNoteInput('');
            }}
          >
            <textarea
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Add a note..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              rows={1}
              style={{ minHeight: 36, maxHeight: 80 }}
            />
            <button
              type="submit"
              className="bg-green-600 text-white rounded-full px-4 py-2 font-bold hover:bg-green-700 transition"
            >
              Add Note
            </button>
          </form>
        </div>
      )}
      {/* Floating Pomodoro Window */}
      {showPomodoro && (
        <div
          ref={pomodoroRef}
          style={{
            position: 'fixed',
            left: pomodoroPos.x,
            top: pomodoroPos.y,
            width: 320,
            maxWidth: '90vw',
            height: 320,
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(220,38,38,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: pomodoroDragging ? 'none' : 'auto',
            cursor: pomodoroDragging ? 'grabbing' : 'default',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-red-600 text-white rounded-t-2xl cursor-move select-none"
            onMouseDown={e => {
              setPomodoroDragging(true);
              const rect = pomodoroRef.current?.getBoundingClientRect();
              setPomodoroDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg">Pomodoro</span>
            <button
              onClick={() => setShowPomodoro(false)}
              className="text-white hover:text-yellow-200 text-xl font-bold focus:outline-none"
              title="Close Pomodoro"
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-5xl font-extrabold text-red-600 mb-2">{formatPomodoroTime(pomodoroTime)}</div>
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isWork ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>{isWork ? 'Work' : 'Break'}</span>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPomodoroRunning(r => !r)}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
              >
                {pomodoroRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => { setPomodoroRunning(false); setPomodoroTime(isWork ? workDuration * 60 : breakDuration * 60); }}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs font-semibold text-gray-600">Work</label>
              <input
                type="number"
                min={1}
                max={120}
                value={workDuration}
                onChange={e => setWorkDuration(Number(e.target.value))}
                className="w-12 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <label className="text-xs font-semibold text-gray-600 ml-2">Break</label>
              <input
                type="number"
                min={1}
                max={60}
                value={breakDuration}
                onChange={e => setBreakDuration(Number(e.target.value))}
                className="w-12 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      )}
      {/* Floating Ask AI Window */}
      {showAskAI && (
        <div
          ref={askAIRef}
          style={{
            position: 'fixed',
            left: askAIPos.x,
            top: askAIPos.y,
            width: 400,
            maxWidth: '90vw',
            height: 340,
            background: 'white',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: askAIDragging ? 'none' : 'auto',
            cursor: askAIDragging ? 'grabbing' : 'default',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl cursor-move select-none"
            onMouseDown={e => {
              setAskAIDragging(true);
              const rect = askAIRef.current?.getBoundingClientRect();
              setAskAIDragOffset({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              });
            }}
          >
            <span className="font-bold text-lg flex items-center">Ask AI</span>
            <button
              onClick={() => setShowAskAI(false)}
              className="text-white hover:text-yellow-200 text-xl font-bold focus:outline-none"
              title="Close Ask AI"
            >
              ×
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 py-2">
            <textarea
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-2"
              rows={2}
              placeholder="Ask anything..."
              value={aiQuestion}
              onChange={e => setAIQuestion(e.target.value)}
              disabled={aiLoading}
            />
            <button
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 mt-1 shadow hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-60"
            >
              {aiLoading ? 'Thinking...' : 'Ask'}
            </button>
            <div className="w-full mt-4 p-3 rounded-lg bg-white border border-gray-200 min-h-[60px] text-gray-800 text-sm overflow-y-auto" style={{ maxHeight: 100 }}>
              {aiAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
