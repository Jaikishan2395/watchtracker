
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Target, Trash2, Calendar, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Playlist } from '@/types/playlist';

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: (id: string) => void;
  delay: number;
}

const PlaylistCard = ({ playlist, onDelete, delay }: PlaylistCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.length > 0 
    ? playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length 
    : 0;
  const totalDuration = playlist.videos.reduce((sum, video) => sum + video.duration, 0);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(playlist.id);
    }, 300);
  };

  return (
    <Card 
      className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale animate-fade-in ${
        isDeleting ? 'animate-scale-out' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
            {playlist.title}
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{playlist.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {playlist.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{playlist.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Progress value={totalProgress} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-green-600" />
            <span>{completedVideos}/{playlist.videos.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{Math.round(totalDuration)} min</span>
          </div>
        </div>

        {playlist.deadline && (
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {new Date(playlist.deadline).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(totalProgress)}% Complete
          </span>
          <Link to={`/playlist/${playlist.id}`}>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Play className="w-3 h-3 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaylistCard;
