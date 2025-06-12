import { useState } from 'react';
import { Plus, X, Loader2, Video as VideoIcon, Code, List, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Playlist, Video, ContentType } from '@/types/playlist';
import { toast } from 'sonner';
import AddCodingPlaylistModal from './AddCodingPlaylistModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (playlist: Playlist) => void;
}

const contentTypeOptions = [
  { value: 'vlog', label: 'Vlogs' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'course', label: 'Educational' },
  { value: 'movie', label: 'Entertainment' },
  { value: 'music', label: 'Music' },
  { value: 'news', label: 'News' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'diy', label: 'DIY' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'tech-talk', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'documentary', label: 'Documentaries' },
  { value: 'animation', label: 'Animation' },
  { value: 'review', label: 'Reviews' },
  { value: 'reaction', label: 'Reactions' },
  { value: 'unboxing', label: 'Unboxings' },
  { value: 'challenge', label: 'Challenges' },
  { value: 'prank', label: 'Pranks' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'interview', label: 'Interviews' },
  { value: 'asmr', label: 'ASMR' },
  { value: 'live-stream', label: 'Livestreams' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'commentary', label: 'Commentary' },
  { value: 'parody', label: 'Parodies' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'memes', label: 'Memes' },
  { value: 'coding-tutorial', label: 'Coding' }
];

const YOUTUBE_API_KEY = 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ';

interface ThumbnailSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (thumbnail: string) => void;
  selectedThumbnail: string;
}

const ThumbnailSelector = ({ isOpen, onClose, onSelect, selectedThumbnail }: ThumbnailSelectorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categoryThumbnails = {
    'Vlogs': [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop&q=80'
    ],
    'Gaming': [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    'Educational': [
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80'
    ],
    'Entertainment': [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
    ],
    'Music': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'News': [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'
    ],
    'Fitness': [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80'
    ],
    'DIY': [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    'Cooking': [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80'
    ],
    'Travel': [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'
    ],
    'Fashion': [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80'
    ],
    'Beauty': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80'
    ],
    'Technology': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ],
    'Sports': [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
    ],
    'Documentaries': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Animation': [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    ],
    'Reviews': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Reactions': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Unboxings': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Challenges': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Pranks': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Podcasts': [
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80'
    ],
    'Interviews': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'ASMR': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Livestreams': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Motivational': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Commentary': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Parodies': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Tutorials': [
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&auto=format&fit=crop&q=80'
    ],
    'Memes': [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    'Coding': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
    ]
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onSelect(reader.result as string);
      setIsUploading(false);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById('thumbnail-upload') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Playlist Thumbnail</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryThumbnails).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
            {selectedCategory && categoryThumbnails[selectedCategory as keyof typeof categoryThumbnails].map((thumbnail, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedThumbnail === thumbnail
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-transparent hover:border-blue-500/50'
                }`}
                onClick={() => onSelect(thumbnail)}
              >
                <img
                  src={thumbnail}
                  alt={`${selectedCategory} thumbnail ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Select</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Upload Custom Thumbnail</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Upload your own image (max 5MB, supported formats: JPG, PNG, GIF)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={triggerFileUpload}
                disabled={isUploading}
                className="h-11"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddPlaylistModal = ({ isOpen, onClose, onAdd }: AddPlaylistModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('course');
  const [thumbnail, setThumbnail] = useState('');
  const [isThumbnailSelectorOpen, setIsThumbnailSelectorOpen] = useState(false);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setContentType('course');
    setThumbnail('');
    onClose();
  };

  const handleSubmit = () => {
    if (!title) {
      toast.error('Please enter a playlist title');
      return;
    }

    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      title,
      description,
      type: 'video',
      contentType,
      thumbnail,
      videos: [],
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    onAdd(newPlaylist);
    handleClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
          <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Playlist Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter playlist description"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(value) => setContentType(value as ContentType)}
              >
                <SelectTrigger id="content-type" className="w-full mt-1">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {contentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Thumbnail</Label>
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsThumbnailSelectorOpen(true)}
                  className="w-full"
                >
                  {thumbnail ? (
                    <div className="relative w-full h-32">
                      <img
                        src={thumbnail}
                        alt="Playlist thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnail('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 py-8">
                      <ImageIcon className="w-6 h-6" />
                      <span>Select Thumbnail</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Playlist
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

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
  const [currentStep, setCurrentStep] = useState(1);
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
  const [timeLock, setTimeLock] = useState({
    enabled: false,
    startTime: '00:00',
    endTime: '23:59',
    days: [0, 1, 2, 3, 4, 5, 6],
    use24Hour: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('');
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);

  const timePresets = [
    { label: 'Morning (6:00 AM - 12:00 PM)', start: '06:00', end: '12:00', icon: '🌅' },
    { label: 'Afternoon (12:00 PM - 6:00 PM)', start: '12:00', end: '18:00', icon: '☀️' },
    { label: 'Evening (6:00 PM - 12:00 AM)', start: '18:00', end: '00:00', icon: '🌆' },
    { label: 'Night (12:00 AM - 6:00 AM)', start: '00:00', end: '06:00', icon: '🌙' },
    { label: 'Work Hours (9:00 AM - 5:00 PM)', start: '09:00', end: '17:00', icon: '💼' },
    { label: 'Study Hours (8:00 AM - 10:00 PM)', start: '08:00', end: '22:00', icon: '📚' },
    { label: 'Full Day (24 Hours)', start: '00:00', end: '23:59', icon: '⏰' },
    { label: 'Custom', start: '', end: '', icon: '⚙️' }
  ];

  const formatTimeForDisplay = (time: string, use24Hour: boolean): string => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = use24Hour ? hours : hours % 12 || 12;
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const parseTimeFromDisplay = (time: string, use24Hour: boolean): string => {
    if (!time) return '';
    
    if (use24Hour) {
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';
    
    const [_, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const validateTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMinutes;
    let endTotal = endHours * 60 + endMinutes;
    
    // Handle case where end time is on the next day
    if (endTotal <= startTotal) {
      endTotal += 24 * 60; // Add 24 hours worth of minutes
    }
    
    return startTotal < endTotal;
  };

  const getTimeLockStatus = () => {
    if (!timeLock.enabled) return { status: 'unlocked', message: 'Playlist is accessible 24/7' };
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    const [startHours, startMinutes] = timeLock.startTime.split(':').map(Number);
    const [endHours, endMinutes] = timeLock.endTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    const isDayAllowed = timeLock.days.includes(currentDay);
    
    // Check if current time is within the allowed range
    let isTimeInRange = false;
    if (endTimeInMinutes > startTimeInMinutes) {
      // Normal case: start time is before end time on the same day
      isTimeInRange = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
    } else {
      // Special case: end time is on the next day
      isTimeInRange = currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
    }
    
    if (!isDayAllowed) {
      const nextAllowedDay = timeLock.days.find(day => day > currentDay) || timeLock.days[0];
      const daysUntilNext = (nextAllowedDay - currentDay + 7) % 7;
      return { 
        status: 'locked', 
        message: `Available on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextAllowedDay]} at ${formatTimeForDisplay(timeLock.startTime, timeLock.use24Hour)} (${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''} from now)` 
      };
    }
    
    if (!isTimeInRange) {
      const nextAvailableTime = timeLock.startTime;
      const nextAvailableDate = new Date(now);
      
      // If current time is past end time, set next available time to tomorrow
      if (currentTimeInMinutes > endTimeInMinutes) {
        nextAvailableDate.setDate(now.getDate() + 1);
      }
      
      nextAvailableDate.setHours(startHours, startMinutes, 0, 0);
      
      const timeUntilNext = nextAvailableDate.getTime() - now.getTime();
      const hoursUntilNext = Math.floor(timeUntilNext / (1000 * 60 * 60));
      const minutesUntilNext = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeMessage = '';
      if (hoursUntilNext > 0) {
        timeMessage = `${hoursUntilNext} hour${hoursUntilNext !== 1 ? 's' : ''}`;
        if (minutesUntilNext > 0) {
          timeMessage += ` and ${minutesUntilNext} minute${minutesUntilNext !== 1 ? 's' : ''}`;
        }
      } else {
        timeMessage = `${minutesUntilNext} minute${minutesUntilNext !== 1 ? 's' : ''}`;
      }
      
      return { 
        status: 'locked', 
        message: `Available in ${timeMessage} (at ${formatTimeForDisplay(timeLock.startTime, timeLock.use24Hour)})` 
      };
    }
    
    return { status: 'unlocked', message: 'Currently accessible' };
  };

  const applyTimePreset = (preset: typeof timePresets[0]) => {
    if (preset.label === 'Custom') return;
    
    const is24HourAccess = preset.start === '00:00' && preset.end === '23:59';
    setTimeLock(prev => ({
      ...prev,
      startTime: preset.start,
      endTime: preset.end,
      enabled: !is24HourAccess,
      days: is24HourAccess ? [] : prev.days
    }));
  };

  const resetTimeSettings = () => {
    setTimeLock(prev => ({
      ...prev,
      startTime: '00:00',
      endTime: '23:59',
      days: [],
      enabled: false,
      use24Hour: true
    }));
  };

  const toggleDay = (day: number) => {
    setTimeLock(prev => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort();
      
      // If no days are selected, disable time lock
      if (newDays.length === 0) {
        return { ...prev, days: newDays, enabled: false };
      }
      
      return { ...prev, days: newDays };
    });
  };

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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title) {
        toast.error('Please enter a playlist title');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (videos.length === 0) {
        toast.error('Please add at least one video to the playlist');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
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
      thumbnail: selectedThumbnail || videos[0].thumbnail,
      videos: videos.map(video => ({
        ...video,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0
      })),
      createdAt: new Date().toISOString(),
      timeLock: timeLock.enabled && (timeLock.startTime !== '00:00' || timeLock.endTime !== '23:59') ? {
        enabled: true,
        startTime: timeLock.startTime,
        endTime: timeLock.endTime,
        days: timeLock.days
      } : undefined
    };

    onAdd(newPlaylist);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step
                ? 'bg-blue-600 text-white'
                : currentStep > step
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep > step ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    const lockStatus = getTimeLockStatus();
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="playlist-title" className="text-sm font-semibold flex items-center gap-2">
                  <span>Playlist Title</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="playlist-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-type" className="text-sm font-semibold">Content Type</Label>
                <select
                  id="content-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full h-11 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="course">Course</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="lecture">Lecture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlist-description" className="text-sm font-semibold flex items-center gap-2">
                <span>Description</span>
                <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a detailed description of your playlist..."
                className="min-h-[120px] text-base resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span>Playlist Thumbnail</span>
                <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <div className="flex items-center gap-4">
                {selectedThumbnail ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                    <img
                      src={selectedThumbnail}
                      alt="Selected thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => setSelectedThumbnail('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No thumbnail</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsThumbnailModalOpen(true)}
                  className="h-11"
                >
                  {selectedThumbnail ? 'Change Thumbnail' : 'Select Thumbnail'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'playlist')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <TabsTrigger 
                value="single" 
                className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                Single Video
              </TabsTrigger>
              <TabsTrigger 
                value="playlist" 
                className="text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                YouTube Playlist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="video-title" className="text-sm font-semibold flex items-center gap-2">
                    <span>Video Title</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="video-title"
                    value={currentVideo.title}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                    placeholder="Enter video title..."
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-url" className="text-sm font-semibold flex items-center gap-2">
                    <span>YouTube URL</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="video-url"
                    value={currentVideo.url}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-time" className="text-sm font-semibold flex items-center gap-2">
                  <span>Schedule Time</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={currentVideo.scheduledTime}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, scheduledTime: e.target.value })}
                  className="h-11 text-base"
                />
              </div>

              <Button
                onClick={addVideo}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Add Video
              </Button>
            </TabsContent>

            <TabsContent value="playlist" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playlist-url" className="text-sm font-semibold flex items-center gap-2">
                  <span>YouTube Playlist URL</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="playlist-url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="h-11 text-base"
                />
              </div>

              <Button
                onClick={handlePlaylistSubmit}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                disabled={isLoadingPlaylist}
              >
                {isLoadingPlaylist ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <List className="w-5 h-5 mr-2" />
                )}
                Load and Add Playlist
              </Button>
            </TabsContent>
          </Tabs>

          {videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-blue-600" />
                  Added Videos ({videos.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVideos([])}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {videos.map((video, index) => (
                  <Card key={index} className="p-4 hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-4">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base truncate">{video.title}</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Duration: {Math.round(video.watchTime)} minutes
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Scheduled: {new Date(video.scheduledTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
          <div className="border rounded-xl p-6 space-y-6 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Access Time Restriction</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {lockStatus.message}
                  </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
                <div
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    timeLock.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                    onClick={() => setTimeLock(prev => ({ 
                      ...prev, 
                      enabled: !prev.enabled,
                      days: !prev.enabled ? [0, 1, 2, 3, 4, 5, 6] : prev.days 
                    }))}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      timeLock.enabled ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </div>

            {timeLock.enabled && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Quick Time Presets</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="time-format" className="text-sm">Time Format:</Label>
                        <select
                          id="time-format"
                          value={timeLock.use24Hour ? '24h' : '12h'}
                          onChange={(e) => setTimeLock(prev => ({ ...prev, use24Hour: e.target.value === '24h' }))}
                          className="h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          <option value="24h">24-hour</option>
                          <option value="12h">12-hour (AM/PM)</option>
                        </select>
                      </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTimeSettings}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Reset Time Settings
                  </Button>
                </div>
                  </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {timePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTimePreset(preset)}
                      className={`text-sm h-9 ${
                        timeLock.startTime === preset.start && timeLock.endTime === preset.end
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                        <span className="mr-2">{preset.icon}</span>
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-sm font-semibold">Access Start Time</Label>
                      <div className="flex items-center gap-2">
                    <Input
                      id="start-time"
                          type={timeLock.use24Hour ? "time" : "text"}
                          value={formatTimeForDisplay(timeLock.startTime, timeLock.use24Hour)}
                          onChange={(e) => {
                            const newTime = parseTimeFromDisplay(e.target.value, timeLock.use24Hour);
                            if (validateTimeRange(newTime, timeLock.endTime)) {
                              setTimeLock(prev => ({ ...prev, startTime: newTime }));
                            } else {
                              toast.error('Start time must be before end time');
                            }
                          }}
                      className="h-11 text-base"
                          placeholder={timeLock.use24Hour ? "HH:mm" : "HH:mm AM/PM"}
                    />
                      </div>
                    <p className="text-xs text-gray-500 mt-1">When users can start accessing the playlist</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-sm font-semibold">Access End Time</Label>
                      <div className="flex items-center gap-2">
                    <Input
                      id="end-time"
                          type={timeLock.use24Hour ? "time" : "text"}
                          value={formatTimeForDisplay(timeLock.endTime, timeLock.use24Hour)}
                          onChange={(e) => {
                            const newTime = parseTimeFromDisplay(e.target.value, timeLock.use24Hour);
                            if (validateTimeRange(timeLock.startTime, newTime)) {
                              setTimeLock(prev => ({ ...prev, endTime: newTime }));
                            } else {
                              toast.error('End time must be after start time');
                            }
                          }}
                      className="h-11 text-base"
                          placeholder={timeLock.use24Hour ? "HH:mm" : "HH:mm AM/PM"}
                    />
                      </div>
                    <p className="text-xs text-gray-500 mt-1">When users can no longer access the playlist</p>
                  </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold block">Available Days</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTimeLock(prev => ({ 
                          ...prev, 
                          days: prev.days.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6] 
                        }))}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {timeLock.days.length === 7 ? 'Clear All' : 'Select All'}
                      </Button>
                    </div>
                  <p className="text-xs text-gray-500">Select the days when users can access the playlist</p>
                  <div className="flex flex-wrap gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <Button
                        key={day}
                        variant={timeLock.days.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(index)}
                        className={`w-14 h-9 ${
                          timeLock.days.includes(index)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">Note:</span> The playlist will be locked outside of the specified time range and on unselected days. Users will see a message indicating when the playlist will become available.
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <DialogHeader className="space-y-4 pb-6 border-b">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Video Playlist
          </DialogTitle>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            {currentStep === 1 && "Step 1: Basic Information"}
            {currentStep === 2 && "Step 2: Add Videos"}
            {currentStep === 3 && "Step 3: Access Settings"}
          </p>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-8 py-6">
          {renderStepContent()}
          </div>

          <div className="flex gap-4 pt-6 border-t">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-11 text-base"
              disabled={isLoading || isLoadingPlaylist}
            >
              Back
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              disabled={isLoading || isLoadingPlaylist}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              disabled={isLoading || isLoadingPlaylist}
            >
              Create Playlist
            </Button>
          )}
        </div>

        <ThumbnailSelector
          isOpen={isThumbnailModalOpen}
          onClose={() => setIsThumbnailModalOpen(false)}
          onSelect={setSelectedThumbnail}
          selectedThumbnail={selectedThumbnail}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlaylistModal;
