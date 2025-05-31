import { useState } from 'react';
import { Plus, X, Loader2, Video as VideoIcon, Code, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';
import AddCodingPlaylistModal from './AddCodingPlaylistModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (playlist: Playlist) => void;
}

type ContentType = 'course' | 'tutorial' | 'lecture' | 'workshop' | 'interview' | 'documentary' | 'conference' | 'webinar' | 'podcast' | 'coding-tutorial' | 'project-walkthrough' | 'tech-talk' | 'other';

const AddPlaylistModal = ({ isOpen, onClose, onAdd }: AddPlaylistModalProps) => {
  const [playlistType, setPlaylistType] = useState<'video' | 'coding' | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);

  const handleClose = () => {
    setPlaylistType(null);
    setIsVideoModalOpen(false);
    setIsCodingModalOpen(false);
    onClose();
  };

  const handleTypeSelect = (type: 'video' | 'coding') => {
    setPlaylistType(type);
    if (type === 'video') {
      setIsVideoModalOpen(true);
    } else {
      setIsCodingModalOpen(true);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Choose Playlist Type
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-6">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500 group"
              onClick={() => handleTypeSelect('video')}
            >
              <CardContent className="p-6 text-center">
                <VideoIcon className="w-12 h-12 mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Video Playlist</h3>
                <p className="text-gray-600 text-sm">
                  Track your progress through educational videos and tutorials
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-green-500 group"
              onClick={() => handleTypeSelect('coding')}
            >
              <CardContent className="p-6 text-center">
                <Code className="w-12 h-12 mx-auto mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Coding Practice</h3>
                <p className="text-gray-600 text-sm">
                  Organize coding problems, track streaks, and monitor progress
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Original Video Playlist Modal */}
      <VideoPlaylistModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onAdd={onAdd}
      />

      {/* New Coding Playlist Modal */}
      <AddCodingPlaylistModal
        isOpen={isCodingModalOpen}
        onClose={() => setIsCodingModalOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
};

const YOUTUBE_API_KEY = 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ';

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

// Extract the original video playlist logic to a separate component
const VideoPlaylistModal = ({ isOpen, onClose, onAdd }: AddPlaylistModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('course');
  const [videos, setVideos] = useState<Omit<Video, 'id' | 'progress'>[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Omit<Video, 'id' | 'progress' | 'thumbnail' | 'dateCompleted' | 'contentType'>>({ 
    title: '', 
    url: '', 
    scheduledTime: '',
    watchTime: 0
  });
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'playlist'>('single');

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

      const newVideos = data.items.map((item: YouTubePlaylistItem, index: number) => {
        const videoInfo = videoData.items[index];
        const duration = videoInfo.contentDetails.duration;
        const watchTime = parseDuration(duration);

        return {
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}&list=${playlistId}`,
          thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
          scheduledTime: '',
          watchTime,
          contentType
        };
      });

      setVideos([...videos, ...newVideos]);
      setPlaylistUrl('');
      toast.success(`Added ${newVideos.length} videos from playlist`);
    } catch (error) {
      toast.error('Failed to load playlist');
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  const addVideo = () => {
    if (!currentVideo.title || !currentVideo.url || !currentVideo.scheduledTime) {
      toast.error('Please fill in all video details including scheduled time');
      return;
    }

    const videoId = extractVideoIdFromUrl(currentVideo.url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    const newVideo: Omit<Video, 'id' | 'progress'> = {
      ...currentVideo,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      dateCompleted: undefined,
      contentType
    };

    setVideos([...videos, newVideo]);
    setCurrentVideo({ 
      title: '', 
      url: '', 
      scheduledTime: '',
      watchTime: 0
    });
    toast.success('Video added to playlist');
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title) {
      toast.error('Please enter a playlist title');
      return;
    }

    if (videos.length === 0) {
      toast.error('Please add at least one video to the playlist');
      return;
    }

    const newPlaylist: Playlist = {
      id: `${Date.now()}`,
      title,
      description,
      type: 'video',
      videos: videos.map(video => ({
        ...video,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0
      })),
      createdAt: new Date().toISOString()
    };

    onAdd(newPlaylist);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Video Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 pb-4">
            <div>
              <Label htmlFor="playlist-title">Playlist Title *</Label>
              <Input
                id="playlist-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title..."
                className="mt-1"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="playlist-description">Description</Label>
              <Input
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter playlist description..."
                className="mt-1"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="content-type">Content Type</Label>
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full mt-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="course">Course</option>
                <option value="tutorial">Tutorial</option>
                <option value="lecture">Lecture</option>
                <option value="workshop">Workshop</option>
                <option value="interview">Interview</option>
                <option value="documentary">Documentary</option>
                <option value="conference">Conference</option>
                <option value="webinar">Webinar</option>
                <option value="podcast">Podcast</option>
                <option value="coding-tutorial">Coding Tutorial</option>
                <option value="project-walkthrough">Project Walkthrough</option>
                <option value="tech-talk">Tech Talk</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

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
                  <Label htmlFor="scheduled-time">Schedule Time *</Label>
                  <Input
                    id="scheduled-time"
                    type="datetime-local"
                    value={currentVideo.scheduledTime}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, scheduledTime: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={addVideo}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Add Video'}
                </Button>
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

                <Button
                  onClick={handlePlaylistSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
            </TabsContent>
          </Tabs>

          {videos.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Added Videos ({videos.length})</h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {videos.map((video, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{video.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {Math.round(video.watchTime)} minutes
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-950">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading || isLoadingPlaylist}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading || isLoadingPlaylist}
            >
              Create Playlist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaylistModal;
