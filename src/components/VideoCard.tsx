import { useState, useEffect, useRef } from 'react';
import { Play, Clock, Edit3, Save, X, ExternalLink, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video } from '@/types/playlist';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface VideoCardProps {
  video: Video;
  onProgressUpdate: (progress: number) => void;
  delay: number;
  index: number;
}

const VideoCard = ({ video, onProgressUpdate, delay, index }: VideoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProgress, setNewProgress] = useState(video.progress.toString());
  const [isScheduled, setIsScheduled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Create audio element for beeping sound
    audioRef.current = new Audio('/beep.mp3');
    
    // Check if video is scheduled
    if (video.scheduledTime) {
      const scheduledTime = new Date(video.scheduledTime).getTime();
      const now = new Date().getTime();
      
      if (scheduledTime > now) {
        setIsScheduled(true);
        const timeUntilScheduled = scheduledTime - now;
        
        // Set timeout for scheduled time
        const timeoutId = setTimeout(() => {
          playBeepSound();
          toast.info(`Time to watch: ${video.title}`);
          setIsScheduled(false);
        }, timeUntilScheduled);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [video.scheduledTime, video.title]);

  const playBeepSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing beep sound:', error);
      });
    }
  };

  const formatDuration = (duration: { hours: number; minutes: number }) => {
    const parts = [];
    if (duration.hours > 0) {
      parts.push(`${duration.hours}h`);
    }
    if (duration.minutes > 0) {
      parts.push(`${duration.minutes}m`);
    }
    return parts.join(' ') || '0m';
  };

  const formatScheduledTime = (scheduledTime: string) => {
    if (!scheduledTime) return '';
    const date = new Date(scheduledTime);
    return date.toLocaleString();
  };

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

  const playVideo = () => {
    navigate(`/playlist/${id}/play?video=${index}`);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 hover:border-gray-300/50 dark:hover:border-slate-600/30" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {video.thumbnail && (
            <div className="relative group">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-32 h-20 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={playVideo}
                className="absolute inset-0 m-auto w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 hover:scale-110"
              >
                <Play className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-50 truncate">{video.title}</h3>
              <div className="flex items-center gap-2">
                {video.scheduledTime && (
                  <Badge variant="outline" className="flex items-center gap-1 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50">
                    <Bell className="w-3 h-3" />
                    {formatScheduledTime(video.scheduledTime)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-200">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{formatDuration(video.duration)}</span>
              </div>
              
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-20 bg-white dark:bg-slate-700/50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button size="sm" onClick={handleSaveProgress} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleCancelEdit} 
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Progress 
                    value={video.progress} 
                    className="w-32 bg-gray-200 dark:bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" 
                  />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{video.progress}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default VideoCard;
