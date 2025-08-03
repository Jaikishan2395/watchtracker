import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Target, Trash2, Calendar, Play, Code, Flame, Lock, Unlock } from 'lucide-react';
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
  readOnly?: boolean;
}

const PlaylistCard = ({ playlist, onDelete, delay = 0, readOnly = false }: PlaylistCardProps) => {
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] animate-fade-in ${
        isDeleting ? 'animate-scale-out' : ''
      } ${isLocked ? 'opacity-80 cursor-not-allowed' : 'hover:border-blue-200 dark:hover:border-slate-600'}`}
      style={{ animationDelay: `${delay}ms`, maxWidth: '320px' }}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-lg group">
        {/* Thumbnail or Fallback */}
        {playlist.thumbnail ? (
          <>
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                if (!parent.querySelector('.thumbnail-fallback')) {
                  parent.innerHTML += `
                    <div class="thumbnail-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                      <div class="text-center p-4">
                        <div class="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          ${isCodingPlaylist ? 
                            '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>' :
                            '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>'
                          }
                        </div>
                        <p class="text-sm font-medium text-white/90">${playlist.title}</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            {/* Play Button Overlay for Video Playlists */}
            {!isCodingPlaylist && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 text-white" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                {isCodingPlaylist ? (
                  <Code className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" fill="currentColor" />
                )}
              </div>
              <p className="text-lg font-medium text-white/90 line-clamp-2">{playlist.title}</p>
            </div>
          </div>
        )}
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-[70%]">
              <div className={`p-1.5 rounded-lg ${
                isCodingPlaylist 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'bg-blue-500/20 text-blue-500'
              }`}>
                {isCodingPlaylist ? (
                  <Code className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" fill="currentColor" />
                )}
              </div>
              <span className="text-sm font-medium text-white/90 line-clamp-1">
                {playlist.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {isCodingPlaylist 
                  ? `${completedItems}/${totalItems} solved` 
                  : `${completedItems}/${totalItems} watched`}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  isCodingPlaylist 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, totalProgress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {!playlist.thumbnail && (
              <div className="flex items-center gap-2 mb-3">
                {isCodingPlaylist ? (
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                    <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                    <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {playlist.title}
                </h3>
              </div>
            )}
            {hasTimeSchedule && isLocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="w-4 h-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unlocks at {unlockTime}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {!readOnly && (
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {isCodingPlaylist ? 'Coding Practice' : 'Playlist'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{playlist.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
        {playlist.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
            {playlist.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="px-4 pt-0 pb-4">
        <div className="flex flex-col gap-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {isCodingPlaylist ? 'Problems Completed' : 'Videos Watched'}
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(totalProgress)}%
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{completedItems} of {totalItems}</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {totalDuration > 0 && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800/50 rounded-md">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDuration(totalDuration)}</p>
                </div>
              </div>
            )}
            
            {playlist.dueDate && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800/50 rounded-md">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(playlist.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            
            {playlist.goal && (
              <div className="col-span-2 flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{playlist.goal}</p>
                </div>
              </div>
            )}

            {isCodingPlaylist && playlist.streakData && (
              <div className="col-span-2 flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {playlist.streakData.currentStreak} days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            {!readOnly && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this playlist? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button 
              size="sm" 
              className={`ml-auto px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                isLocked 
                  ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
              onClick={handleViewClick}
              disabled={isLocked}
            >
              <div className="flex items-center">
                {isLocked ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : isCodingPlaylist ? (
                  <Code className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {isLocked ? 'Content Locked' : isCodingPlaylist ? 'Start Practicing' : 'Continue Watching'}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default PlaylistCard;
