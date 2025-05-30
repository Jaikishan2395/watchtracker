import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Playlist } from '@/types/playlist';

interface PlaylistContextType {
  playlists: Playlist[];
  addPlaylist: (playlist: Playlist) => void;
  deletePlaylist: (id: string) => void;
  updatePlaylist: (id: string, updatedPlaylist: Playlist) => void;
  updateTotalVideosCount: () => void;
  totalVideos: number;
  totalCodingQuestions: number;
  isLoading: boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalCodingQuestions, setTotalCodingQuestions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update total counts
  const updateTotalVideosCount = () => {
    try {
      const videoCount = playlists.reduce((count, playlist) => {
        if (playlist.type === 'video' && Array.isArray(playlist.videos)) {
          return count + playlist.videos.length;
        }
        return count;
      }, 0);
      setTotalVideos(videoCount);

      const codingCount = playlists.reduce((count, playlist) => {
        if (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)) {
          return count + playlist.codingQuestions.length;
        }
        return count;
      }, 0);
      setTotalCodingQuestions(codingCount);
    } catch (error) {
      console.error('Error updating counts:', error);
    }
  };

  // Load playlists from localStorage on mount
  useEffect(() => {
    const loadPlaylists = () => {
      try {
        setIsLoading(true);
        const savedPlaylists = localStorage.getItem('youtubePlaylists');
        if (savedPlaylists) {
          const parsedPlaylists = JSON.parse(savedPlaylists);
          if (Array.isArray(parsedPlaylists)) {
            // Filter out any invalid or empty playlists
            const validPlaylists = parsedPlaylists.filter(playlist => 
              playlist && 
              typeof playlist === 'object' &&
              playlist.id && 
              playlist.title && 
              playlist.type && 
              ((playlist.type === 'video' && Array.isArray(playlist.videos)) || 
               (playlist.type === 'coding' && Array.isArray(playlist.codingQuestions)))
            );
            setPlaylists(validPlaylists);
            updateTotalVideosCount();
          } else {
            console.error('Invalid playlists data format');
            setPlaylists([]);
          }
        } else {
          setPlaylists([]);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        setPlaylists([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadPlaylists();
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && playlists.length >= 0) {
      try {
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        updateTotalVideosCount();
      } catch (error) {
        console.error('Error saving playlists:', error);
      }
    }
  }, [playlists, isInitialized]);

  const addPlaylist = (playlist: Playlist) => {
    try {
      setPlaylists(prev => {
        // Check if playlist with same ID already exists
        const exists = prev.some(p => p.id === playlist.id);
        if (!exists) {
          // Validate playlist before adding
          if (!playlist.id || !playlist.title || !playlist.type) {
            console.error('Invalid playlist data:', playlist);
            return prev;
          }

          // Additional validation for coding playlists
          if (playlist.type === 'coding') {
            if (!Array.isArray(playlist.codingQuestions) || playlist.codingQuestions.length === 0) {
              console.error('Coding playlist must have at least one question');
              return prev;
            }
            // Validate each coding question
            const invalidQuestions = playlist.codingQuestions.filter(q => 
              !q.id || !q.title || !q.difficulty || !q.category
            );
            if (invalidQuestions.length > 0) {
              console.error('Invalid coding questions found:', invalidQuestions);
              return prev;
            }
          }

          // Additional validation for video playlists
          if (playlist.type === 'video') {
            if (!Array.isArray(playlist.videos) || playlist.videos.length === 0) {
              console.error('Video playlist must have at least one video');
              return prev;
            }
          }

          const newPlaylists = [...prev, playlist];
          return newPlaylists;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error adding playlist:', error);
    }
  };

  const deletePlaylist = (id: string) => {
    try {
      // Update state
      setPlaylists(prev => prev.filter(playlist => playlist.id !== id));
      
      // Update localStorage
      const savedPlaylists = localStorage.getItem('youtubePlaylists');
      if (savedPlaylists) {
        const playlists: Playlist[] = JSON.parse(savedPlaylists);
        const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
        localStorage.setItem('youtubePlaylists', JSON.stringify(updatedPlaylists));
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const updatePlaylist = (id: string, updatedPlaylist: Playlist) => {
    try {
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === id ? updatedPlaylist : playlist
      ));
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  return (
    <PlaylistContext.Provider value={{ 
      playlists, 
      addPlaylist, 
      deletePlaylist, 
      updatePlaylist, 
      updateTotalVideosCount, 
      totalVideos,
      totalCodingQuestions,
      isLoading
    }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
} 