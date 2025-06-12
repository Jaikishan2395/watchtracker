import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Target, Trash2, Calendar, Play, Code, Flame, Eye, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist, Video } from '@/types/playlist';
import { usePlaylists } from '@/context/PlaylistContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: (id: string) => void;
  delay: number;
}

const PlaylistCard = ({ playlist, onDelete, delay = 0 }: PlaylistCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockTime, setUnlockTime] = useState<string>('');
  const navigate = useNavigate();
  const { updatePlaylist } = usePlaylists();
  console.log('PlaylistCard: Rendering card for playlist:', playlist);

  // Different calculations for video vs coding playlists
  const isCodingPlaylist = playlist.type === 'coding';
  console.log('PlaylistCard: Is coding playlist:', isCodingPlaylist);
  
  let completedItems = 0;
  let totalItems = 0;
  let totalProgress = 0;
  let totalDuration = 0;

  if (isCodingPlaylist) {
    totalItems = playlist.codingQuestions?.length || 0;
    completedItems = playlist.codingQuestions?.filter(q => q.solved).length || 0;
    totalProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    totalDuration = playlist.codingQuestions?.reduce((sum, q) => sum + (q.timeSpent || 0), 0) || 0;
  } else {
    const videos = playlist.videos;
    console.log('PlaylistCard: Video playlist videos:', videos);
    totalItems = videos.length;
    completedItems = videos.filter((video) => video.progress >= 100).length;
    totalProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    totalDuration = videos.reduce((acc, video) => acc + video.watchTime, 0);
  }

  const handleDelete = () => {
    if (isLocked) return;
    console.log('PlaylistCard: Deleting playlist:', playlist.id);
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(playlist.id);
    }, 300);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    console.log('PlaylistCard: Navigating to playlist:', {
      id: playlist.id,
      title: playlist.title,
      type: playlist.type
    });
    navigate(`/playlist/${playlist.id}`);
  };

  const getNextUnlockTime = () => {
    if (!playlist.timeLock?.enabled) return '';

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [endHour, endMinute] = playlist.timeLock.endTime.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    // If current time is past end time, find next available day
    if (currentTime >= endTimeInMinutes) {
      const nextDay = playlist.timeLock.days.find(day => day > currentDay) || playlist.timeLock.days[0];
      const daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
      
      const unlockDate = new Date(now);
      unlockDate.setDate(now.getDate() + daysUntilNext);
      unlockDate.setHours(endHour, endMinute, 0, 0);
      
      return unlockDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    // If within same day, return today's unlock time
    const unlockDate = new Date(now);
    unlockDate.setHours(endHour, endMinute, 0, 0);
    return unlockDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const checkLockStatus = () => {
    if (!playlist.timeLock?.enabled) {
      setIsLocked(false);
      setUnlockTime('');
      return;
    }
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = playlist.timeLock.startTime.split(':').map(Number);
    const [endHour, endMinute] = playlist.timeLock.endTime.split(':').map(Number);
    
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    const shouldBeLocked = (
      playlist.timeLock.days.includes(currentDay) &&
      currentTime >= startTimeInMinutes &&
      currentTime <= endTimeInMinutes
    );
    
    setIsLocked(shouldBeLocked);
    setUnlockTime(getNextUnlockTime());
  };

  // Check lock status initially and set up interval
  useEffect(() => {
    checkLockStatus();
    const interval = setInterval(checkLockStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [playlist.timeLock]);

  const hasTimeSchedule = playlist.timeLock?.startTime && playlist.timeLock?.endTime && playlist.timeLock?.days?.length > 0;

  return (
    <Card 
      className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale animate-fade-in ${
        isDeleting ? 'animate-scale-out' : ''
      } ${isLocked ? 'opacity-80 cursor-not-allowed' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {playlist.thumbnail && (
        <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      <CardHeader className={`pb-3 ${playlist.thumbnail ? 'pt-6' : 'pt-4'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1 mr-2">
            {isCodingPlaylist ? (
              <Code className="w-6 h-6 text-green-600" />
            ) : (
              <Play className="w-6 h-6 text-blue-600" />
            )}
            <CardTitle className="text-xl line-clamp-2 text-black">
              {playlist.title}
            </CardTitle>
            {hasTimeSchedule && isLocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="w-5 h-5 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unlocks at {unlockTime}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasTimeSchedule && !isLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updatedPlaylist = {
                    ...playlist,
                    timeLock: {
                      ...playlist.timeLock,
                      enabled: !playlist.timeLock?.enabled
                    }
                  };
                  updatePlaylist(playlist.id, updatedPlaylist);
                }}
                className={`${playlist.timeLock?.enabled ? 'text-blue-500' : 'text-gray-500'} hover:bg-gray-100`}
              >
                {playlist.timeLock?.enabled ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
              </Button>
            )}
            {!isLocked && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-black">Delete {isCodingPlaylist ? 'Coding Practice' : 'Playlist'}</AlertDialogTitle>
                    <AlertDialogDescription className="text-black">
                      Are you sure you want to delete "{playlist.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {playlist.description && (
          <p className="text-base text-black line-clamp-2 mt-2">{playlist.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 py-6">
        <Progress value={totalProgress} className="h-3" />
        
        <div className="grid grid-cols-2 gap-6 text-base">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-black">{completedItems}/{totalItems} {isCodingPlaylist ? 'solved' : 'completed'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-black">{Math.round(totalDuration)} {isCodingPlaylist ? 'min' : 'min'}</span>
          </div>
        </div>

        {/* Coding-specific stats */}
        {isCodingPlaylist && playlist.streakData && (
          <div className="flex items-center gap-2 text-base text-orange-600">
            <Flame className="w-5 h-5" />
            <span className="text-black">Streak: {playlist.streakData.currentStreak} days</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-black">
            {Math.round(totalProgress)}% Complete
          </span>
          <Button 
            size="lg" 
            className={`${
              isCodingPlaylist 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white px-6`}
            onClick={handleViewClick}
            disabled={isLocked}
          >
            {isCodingPlaylist ? <Code className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isLocked ? 'Locked' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default PlaylistCard;
