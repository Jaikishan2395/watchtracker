
import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (playlist: Playlist) => void;
}

const AddPlaylistModal = ({ isOpen, onClose, onAdd }: AddPlaylistModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [videos, setVideos] = useState<Omit<Video, 'id' | 'progress'>[]>([]);
  const [currentVideo, setCurrentVideo] = useState({ title: '', url: '', duration: 0 });
  const [isLoading, setIsLoading] = useState(false);

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

  const addVideo = () => {
    if (!currentVideo.title || !currentVideo.url || currentVideo.duration <= 0) {
      toast.error('Please fill in all video details');
      return;
    }

    const videoId = extractVideoIdFromUrl(currentVideo.url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    const newVideo = {
      ...currentVideo,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };

    setVideos([...videos, newVideo]);
    setCurrentVideo({ title: '', url: '', duration: 0 });
    toast.success('Video added to playlist');
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a playlist title');
      return;
    }

    if (videos.length === 0) {
      toast.error('Please add at least one video');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const playlist: Playlist = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
      videos: videos.map((video, index) => ({
        ...video,
        id: `${Date.now()}-${index}`,
        progress: 0
      }))
    };

    onAdd(playlist);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
    setVideos([]);
    setCurrentVideo({ title: '', url: '', duration: 0 });
    setIsLoading(false);
    
    toast.success('Playlist created successfully!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Playlist Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter playlist description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Add Video Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Add Videos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="video-duration">Duration (minutes) *</Label>
                <Input
                  id="video-duration"
                  type="number"
                  min="1"
                  value={currentVideo.duration || ''}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, duration: parseInt(e.target.value) || 0 })}
                  placeholder="Duration in minutes..."
                  className="mt-1"
                />
              </div>
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

            <Button
              onClick={addVideo}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Video to Playlist
            </Button>
          </div>

          {/* Videos List */}
          {videos.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">Videos ({videos.length})</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {videos.map((video, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{video.title}</h4>
                        <p className="text-xs text-gray-600">{video.duration} minutes</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Playlist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaylistModal;
