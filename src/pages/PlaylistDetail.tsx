
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Playlist not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;
  const totalDuration = playlist.videos.reduce((sum, video) => sum + video.duration, 0);
  const watchedTime = playlist.videos.reduce((sum, video) => sum + (video.duration * video.progress / 100), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{playlist.title}</h1>
                <p className="text-gray-600 mb-4">{playlist.description}</p>
              </div>
              <Button
                onClick={() => setIsAddVideoModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-green-600" />
                <span>{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{Math.round(watchedTime)}/{Math.round(totalDuration)} min</span>
              </div>
              {playlist.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Due: {new Date(playlist.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={totalProgress} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">{Math.round(totalProgress)}% Complete</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Watched:</span>
                  <span className="font-semibold">{Math.round(watchedTime)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="font-semibold">{Math.round(totalDuration - watchedTime)} min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Deadline
                {!editingDeadline && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDeadline(true)}
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
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDeadline}>
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingDeadline(false)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">
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
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Videos</h2>
          {playlist.videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              onProgressUpdate={(progress) => updateVideoProgress(video.id, progress)}
              delay={index * 50}
            />
          ))}
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
