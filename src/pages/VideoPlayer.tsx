
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIndex = parseInt(searchParams.get('video') || '0');
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('youtubePlaylists');
    if (savedPlaylists) {
      const playlists: Playlist[] = JSON.parse(savedPlaylists);
      const found = playlists.find(p => p.id === id);
      if (found) {
        setPlaylist(found);
      }
    }
  }, [id]);

  const updateVideoProgress = (videoId: string, progress: number) => {
    if (!playlist) return;

    const updatedVideos = playlist.videos.map(video =>
      video.id === videoId ? { ...video, progress } : video
    );

    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    
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
    
    toast.success('Progress updated!');
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      navigate(`/playlist/${id}/play?video=${currentVideoIndex - 1}`);
    }
  };

  const goToNextVideo = () => {
    if (playlist && currentVideoIndex < playlist.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      navigate(`/playlist/${id}/play?video=${currentVideoIndex + 1}`);
    }
  };

  const markAsComplete = () => {
    if (playlist && currentVideo) {
      updateVideoProgress(currentVideo.id, 100);
    }
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

  const currentVideo = playlist.videos[currentVideoIndex];
  
  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Video not found</p>
            <Button onClick={() => navigate(`/playlist/${id}`)} className="mt-4">
              Back to Playlist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const completedVideos = playlist.videos.filter(v => v.progress >= 100).length;
  const totalProgress = playlist.videos.reduce((sum, video) => sum + video.progress, 0) / playlist.videos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate(`/playlist/${id}`)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playlist
          </Button>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{playlist.title}</h1>
            <p className="text-gray-600 mb-4">
              Video {currentVideoIndex + 1} of {playlist.videos.length}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Overall Progress: {Math.round(totalProgress)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
              <CardContent className="p-6">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(currentVideo.url)}
                    title={currentVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Info */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{currentVideo.title}</CardTitle>
                  {currentVideo.progress >= 100 && (
                    <Badge className="bg-green-600 hover:bg-green-600">
                      Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentVideo.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Progress: {currentVideo.progress}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={currentVideo.progress} className="h-3" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 25)}
                        disabled={currentVideo.progress >= 25}
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 50)}
                        disabled={currentVideo.progress >= 50}
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 75)}
                        disabled={currentVideo.progress >= 75}
                      >
                        75%
                      </Button>
                      <Button
                        size="sm"
                        onClick={markAsComplete}
                        disabled={currentVideo.progress >= 100}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousVideo}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    {currentVideoIndex + 1} / {playlist.videos.length}
                  </span>
                  
                  <Button
                    onClick={goToNextVideo}
                    disabled={currentVideoIndex === playlist.videos.length - 1}
                    variant="outline"
                  >
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Playlist Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Playlist Videos</h3>
            {playlist.videos.map((video, index) => (
              <Card
                key={video.id}
                className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  index === currentVideoIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  navigate(`/playlist/${id}/play?video=${index}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">{video.duration} min</span>
                        {video.progress >= 100 && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <Progress value={video.progress} className="h-1 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
