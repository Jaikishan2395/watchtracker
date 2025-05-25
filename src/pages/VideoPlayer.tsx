
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, CheckCircle, Clock, Play, List, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Playlist, Video } from '@/types/playlist';
import { toast } from 'sonner';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIndex = parseInt(searchParams.get('video') || '0');
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex);
  const [showAllVideos, setShowAllVideos] = useState(false);

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
      toast.success('Next video loaded!');
    }
  };

  const selectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    navigate(`/playlist/${id}/play?video=${index}`);
    toast.success(`Now playing: ${playlist?.videos[index].title}`);
  };

  const markAsComplete = () => {
    if (playlist && currentVideo) {
      updateVideoProgress(currentVideo.id, 100);
      toast.success(`"${currentVideo.title}" marked as complete!`);
    }
  };

  const markAllAsComplete = () => {
    if (!playlist) return;
    
    playlist.videos.forEach(video => {
      if (video.progress < 100) {
        updateVideoProgress(video.id, 100);
      }
    });
    toast.success('All videos marked as complete!');
  };

  const playNextUnwatched = () => {
    if (!playlist) return;
    
    const nextUnwatched = playlist.videos.findIndex((video, index) => 
      video.progress < 100 && index > currentVideoIndex
    );
    
    if (nextUnwatched !== -1) {
      selectVideo(nextUnwatched);
    } else {
      toast.info('All remaining videos are completed!');
    }
  };

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Playlist not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to WatchMap
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
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/playlist/${id}`)}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Playlist
            </Button>
            <div className="text-2xl font-bold text-gray-800">WatchMap</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{playlist.title}</h1>
            <p className="text-gray-600 mb-4">
              Video {currentVideoIndex + 1} of {playlist.videos.length}
            </p>
            
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{completedVideos}/{playlist.videos.length} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Overall Progress: {Math.round(totalProgress)}%</span>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <Select
                value={currentVideoIndex.toString()}
                onValueChange={(value) => selectVideo(parseInt(value))}
              >
                <SelectTrigger className="w-80 bg-white/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm">
                  {playlist.videos.map((video, index) => (
                    <SelectItem key={video.id} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span className="truncate">{video.title}</span>
                        {video.progress >= 100 && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="bg-white/70 hover:bg-white/90"
              >
                <List className="w-4 h-4 mr-2" />
                {showAllVideos ? 'Hide' : 'Show'} All Videos
              </Button>

              <Button
                onClick={playNextUnwatched}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Next Unwatched
              </Button>

              <Button
                onClick={markAllAsComplete}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete All
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20">
              <CardContent className="p-6">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-xl">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20">
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

                  <div className="space-y-3">
                    <Progress value={currentVideo.progress} className="h-3" />
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 25)}
                        disabled={currentVideo.progress >= 25}
                        className="bg-white/70 hover:bg-white/90"
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 50)}
                        disabled={currentVideo.progress >= 50}
                        className="bg-white/70 hover:bg-white/90"
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVideoProgress(currentVideo.id, 75)}
                        disabled={currentVideo.progress >= 75}
                        className="bg-white/70 hover:bg-white/90"
                      >
                        75%
                      </Button>
                      <Button
                        size="sm"
                        onClick={markAsComplete}
                        disabled={currentVideo.progress >= 100}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in border border-white/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousVideo}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                    className="bg-white/70 hover:bg-white/90"
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 font-medium">
                    {currentVideoIndex + 1} / {playlist.videos.length}
                  </span>
                  
                  <Button
                    onClick={goToNextVideo}
                    disabled={currentVideoIndex === playlist.videos.length - 1}
                    variant="outline"
                    className="bg-white/70 hover:bg-white/90"
                  >
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Playlist Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Playlist Videos</h3>
              <Badge variant="outline" className="bg-white/70">
                {completedVideos}/{playlist.videos.length}
              </Badge>
            </div>
            
            <div className={`space-y-3 ${showAllVideos ? 'max-h-none' : 'max-h-[600px] overflow-y-auto'}`}>
              {playlist.videos.map((video, index) => (
                <Card
                  key={video.id}
                  className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                    index === currentVideoIndex ? 'ring-2 ring-blue-500 bg-blue-50/80' : ''
                  }`}
                  onClick={() => selectVideo(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        video.progress >= 100 
                          ? 'bg-green-600 text-white' 
                          : index === currentVideoIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200'
                      }`}>
                        {video.progress >= 100 ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : index === currentVideoIndex ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          index === currentVideoIndex ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                          {video.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">{video.duration} min</span>
                          <span className="text-xs text-gray-600">{video.progress}%</span>
                          {index === currentVideoIndex && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              Now Playing
                            </Badge>
                          )}
                        </div>
                        <Progress value={video.progress} className="h-2 mt-2" />
                        
                        {/* Quick action buttons */}
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateVideoProgress(video.id, 100);
                            }}
                            disabled={video.progress >= 100}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateVideoProgress(video.id, 0);
                            }}
                            disabled={video.progress === 0}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
