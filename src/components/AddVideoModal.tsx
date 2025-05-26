
import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video } from '@/types/playlist';
import { toast } from 'sonner';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: Omit<Video, 'id' | 'progress'>) => void;
}

const AddVideoModal = ({ isOpen, onClose, onAdd }: AddVideoModalProps) => {
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

  const handleSubmit = async () => {
    if (!currentVideo.title || !currentVideo.url || currentVideo.duration <= 0) {
      toast.error('Please fill in all video details');
      return;
    }

    const videoId = extractVideoIdFromUrl(currentVideo.url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newVideo = {
      ...currentVideo,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };

    onAdd(newVideo);
    
    // Reset form
    setCurrentVideo({ title: '', url: '', duration: 0 });
    setIsLoading(false);
    
    toast.success('Video added to playlist!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Video to Playlist</DialogTitle>
        </DialogHeader>

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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Video
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoModal;
