
import { useState } from 'react';
import { Play, Clock, Edit3, Save, X, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video } from '@/types/playlist';

interface VideoCardProps {
  video: Video;
  onProgressUpdate: (progress: number) => void;
  delay: number;
}

const VideoCard = ({ video, onProgressUpdate, delay }: VideoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProgress, setNewProgress] = useState(video.progress.toString());

  const handleSaveProgress = () => {
    const progress = Math.max(0, Math.min(100, parseInt(newProgress) || 0));
    onProgressUpdate(progress);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewProgress(video.progress.toString());
    setIsEditing(false);
  };

  const openVideo = () => {
    window.open(video.url, '_blank');
  };

  return (
    <Card 
      className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video Thumbnail */}
          <div className="relative lg:w-48 h-32 lg:h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {video.progress >= 100 && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600 hover:bg-green-600">
                  Complete
                </Badge>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-4">
                {video.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={openVideo}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{video.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{Math.round(video.duration * video.progress / 100)} min watched</span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{video.progress}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(e.target.value)}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-sm">%</span>
                    <Button
                      size="sm"
                      onClick={handleSaveProgress}
                      className="h-8 px-2"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-8 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Progress value={video.progress} className="h-2" />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onProgressUpdate(0)}
                disabled={video.progress === 0}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onProgressUpdate(50)}
                disabled={video.progress >= 50}
              >
                50%
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onProgressUpdate(100)}
                disabled={video.progress >= 100}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
