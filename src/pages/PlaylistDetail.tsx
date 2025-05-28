import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Calendar, Edit3, Save, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VideoCard from '@/components/VideoCard';
import AddVideoModal from '@/components/AddVideoModal';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const found = playlists.find(p => p.id === id);
      if (found) {
        setPlaylist(found);
        setNewDeadline(found.deadline || '');
      }
    }
  }, [id]);

  const updatePlaylist = (updatedPlaylist: Playlist) => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const index = playlists.findIndex(p => p.id === id);
      if (index !== -1) {
        playlists[index] = updatedPlaylist;
        localStorage.setItem('youtubePlaylists', JSON.stringify(playlists));
        setPlaylist(updatedPlaylist);
      }
    }
  };

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    updatePlaylist(updatedPlaylist);
    toast.success('Progress updated!');
  };

  const addVideoToPlaylist = (video: Omit<Video, 'id' | 'progress'>) => {
    if (!playlist) return;

    const newVideo: Video = {
      ...video,
      id: `${Date.now()}`,
      progress: 0
    };

    const updatedVideos = [...playlist.videos, newVideo];
    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    updatePlaylist(updatedPlaylist);
  };

  const saveDeadline = () => {
    if (!playlist) return;

    const updatedPlaylist = { ...playlist, deadline: newDeadline };
    updatePlaylist(updatedPlaylist);
    setEditingDeadline(false);
    toast.success('Deadline updated!');
  };

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30">
          <CardContent className="py-8 text-center">
            <p className="text-gray-800 dark:text-gray-100">Playlist not found</p>
            <Button onClick={() => navigate('/library')} className="mt-4">
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;
  
  // Convert duration to total minutes for calculations
  const getTotalMinutes = (duration: { hours: number; minutes: number }) => {
    return duration.hours * 60 + duration.minutes;
  };
  
  const totalDuration = playlist.videos.reduce((sum, video) => sum + getTotalMinutes(video.duration), 0);
  const watchedTime = playlist.videos.reduce((sum, video) => {
    const videoMinutes = getTotalMinutes(video.duration);
    return sum + (videoMinutes * video.progress / 100);
  }, 0);

  const uncompletedVideos = playlist.videos.filter(video => video.progress < 100);
  const completedVideosList = playlist.videos.filter(video => video.progress >= 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800/95 dark:to-indigo-950/95 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="mb-4 hover:bg-white/50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          
          <div className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-slate-700/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-2 transition-colors duration-200">{playlist.title}</h1>
                <p className="text-gray-600 dark:text-gray-200 mb-4 transition-colors duration-200">{playlist.description}</p>
              </div>
              <Button
                onClick={() => setIsAddVideoModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium">{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{Math.round(watchedTime)}/{Math.round(totalDuration)} min</span>
              </div>
              {playlist.deadline && (
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 transition-colors duration-200">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Due: {new Date(playlist.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={totalProgress} className="h-3 mb-2 bg-gray-200 dark:bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" />
              <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">{Math.round(totalProgress)}% Complete</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Watched:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(watchedTime)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">Remaining:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">{Math.round(totalDuration - watchedTime)} min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 dark:text-gray-50 transition-colors duration-200 flex items-center justify-between">
                Deadline
                {!editingDeadline && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDeadline(true)}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingDeadline ? (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="bg-white dark:bg-slate-700/50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDeadline} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors duration-200">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingDeadline(false)}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                  {playlist.deadline
                    ? new Date(playlist.deadline).toLocaleDateString()
                    : 'No deadline set'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Videos List */}
        <div className="space-y-8">
          {/* Uncompleted Videos Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">Uncompleted Videos</h2>
              <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                {uncompletedVideos.length} {uncompletedVideos.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
            <div className="space-y-4">
              {uncompletedVideos.length > 0 ? (
                uncompletedVideos.map((video, index) => (
                  <div 
                    key={video.id}
                    className="transform transition-all duration-200 hover:scale-[1.01]"
                  >
                    <VideoCard
                      video={video}
                      onProgressUpdate={(progress) => updateVideoProgress(video.id, progress)}
                      delay={index * 50}
                      index={index}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/50 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 rounded-lg border border-gray-200/50 dark:border-slate-700/30">
                  <p className="text-gray-600 dark:text-gray-200 transition-colors duration-200">
                    All videos are completed! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Videos Section */}
          {completedVideosList.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-50 transition-colors duration-200">Completed Videos</h2>
                <span className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-200">
                  {completedVideosList.length} {completedVideosList.length === 1 ? 'video' : 'videos'}
                </span>
              </div>
              <div className="space-y-4 opacity-80">
                {completedVideosList.map((video, index) => (
                  <div 
                    key={video.id}
                    className="transform transition-all duration-200 hover:scale-[1.01]"
                  >
                    <VideoCard
                      video={video}
                      onProgressUpdate={(progress) => updateVideoProgress(video.id, progress)}
                      delay={index * 50}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          onClose={() => setIsAddVideoModalOpen(false)}
          onAdd={addVideoToPlaylist}
        />
      </div>
    </div>
  );
};

export default PlaylistDetail;
