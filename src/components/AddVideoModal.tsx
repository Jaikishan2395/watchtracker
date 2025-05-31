import { useState, useEffect } from 'react';
import { Plus, X, Loader2, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video } from '@/types/playlist';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const YOUTUBE_API_KEY = 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: Omit<Video, 'id' | 'progress'>) => void;
  onFetchedVideos: (videos: Video[]) => void;
}

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    thumbnails: {
      maxres?: { url: string };
      high: { url: string };
    };
  };
  contentDetails: {
    videoId: string;
  };
}

interface YouTubeVideoDetails {
  contentDetails: {
    duration: string;
  };
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
}

interface YouTubeVideoResponse {
  items: YouTubeVideoDetails[];
}

const AddVideoModal = ({ isOpen, onClose, onAdd, onFetchedVideos }: AddVideoModalProps) => {
  const [activeTab, setActiveTab] = useState<'single' | 'playlist'>('single');
  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    url: '',
    duration: { hours: 0, minutes: 0 },
    scheduledTime: '',
    watchTime: 0
  });
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  const extractVideoIdFromUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/playlist\?list=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractPlaylistIdFromUrl = (url: string): string | null => {
    const pattern = /[&?]list=([^&\n?#]+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  };

  const handleSubmit = async () => {
    if (!currentVideo.title || !currentVideo.url) {
      toast.error('Please fill in all video details');
      return;
    }

    const videoId = extractVideoIdFromUrl(currentVideo.url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch video details from YouTube API
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const videoData = data.items[0];
      const duration = videoData.contentDetails.duration;
      const watchTime = parseDuration(duration);

      const newVideo = {
        ...currentVideo,
        title: videoData.snippet.title,
        thumbnail: videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high?.url,
        watchTime
      };

      onAdd(newVideo);
      
      // Reset form
      setCurrentVideo({
        title: '',
        url: '',
        duration: { hours: 0, minutes: 0 },
        scheduledTime: '',
        watchTime: 0
      });
      
      toast.success('Video added to playlist!');
      onClose();
    } catch (error) {
      toast.error('Failed to add video');
    } finally {
      setIsLoading(false);
    }
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = (match[1] && parseInt(match[1])) || 0;
    const minutes = (match[2] && parseInt(match[2])) || 0;
    const seconds = (match[3] && parseInt(match[3])) || 0;

    return hours * 60 + minutes + seconds / 60;
  };

  const handlePlaylistSubmit = async () => {
    if (!playlistUrl) {
      toast.error('Please enter a playlist URL');
      return;
    }

    const playlistId = extractPlaylistIdFromUrl(playlistUrl);
    if (!playlistId) {
      toast.error('Invalid YouTube playlist URL');
      return;
    }

    setIsLoadingPlaylist(true);

    try {
      // Fetch playlist details
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
      );
      const data: YouTubePlaylistResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Playlist not found or empty');
      }

      // Fetch video details for each video in the playlist
      const videoIds = data.items.map((item: YouTubePlaylistItem) => item.contentDetails.videoId).join(',');
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      const videoData: YouTubeVideoResponse = await videoResponse.json();

      const videos = data.items.map((item: YouTubePlaylistItem, index: number) => {
        const videoInfo = videoData.items[index];
        const duration = videoInfo.contentDetails.duration;
        const watchTime = parseDuration(duration);

        return {
          id: `${Date.now()}-${index}`,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}&list=${playlistId}`,
          thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
          scheduledTime: '',
          watchTime,
          progress: 0
        };
      });

      onFetchedVideos(videos);
      toast.success('Playlist loaded successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to load playlist');
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add to Playlist</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'playlist')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Video</TabsTrigger>
            <TabsTrigger value="playlist">YouTube Playlist</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-title">Video Title *</Label>
                <Input
                  id="video-title"
                  value={currentVideo.title}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                  placeholder="Enter video title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="video-url">YouTube URL *</Label>
                <Input
                  id="video-url"
                  value={currentVideo.url}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="scheduled-time">Schedule Time (Optional)</Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={currentVideo.scheduledTime}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, scheduledTime: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add Video'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="playlist">
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-url">YouTube Playlist URL *</Label>
                <Input
                  id="playlist-url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoadingPlaylist}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePlaylistSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoadingPlaylist}
                >
                  {isLoadingPlaylist ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <List className="w-4 h-4 mr-2" />
                  )}
                  Load and Add Playlist
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoModal;
