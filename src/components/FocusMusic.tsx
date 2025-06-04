import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface FocusMusic {
  id: string;
  title: string;
  type: 'nature' | 'ambient' | 'lofi' | 'classical';
  url: string;
  duration: number;
  icon: string;
}

const FOCUS_MUSIC: FocusMusic[] = [
  {
    id: 'rain',
    title: 'Rain Sounds',
    type: 'nature',
    url: '/sounds/rain.mp3',
    duration: 1800,
    icon: '🌧️'
  },
  {
    id: 'cafe',
    title: 'Cafe Ambience',
    type: 'ambient',
    url: '/sounds/cafe.mp3',
    duration: 1800,
    icon: '☕'
  },
  {
    id: 'lofi',
    title: 'Lo-fi Beats',
    type: 'lofi',
    url: '/sounds/lofi.mp3',
    duration: 1800,
    icon: '🎵'
  },
  {
    id: 'classical',
    title: 'Classical Piano',
    type: 'classical',
    url: '/sounds/classical.mp3',
    duration: 1800,
    icon: '🎹'
  }
];

interface FocusMusicProps {
  isPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
}

export function FocusMusic({ isPlaying, onPlayStateChange }: FocusMusicProps) {
  const [selectedMusic, setSelectedMusic] = useState<FocusMusic | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleMusicSelect = (music: FocusMusic) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedMusic(music);
    onPlayStateChange(true);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          Focus Music
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FOCUS_MUSIC.map((music) => (
              <motion.div
                key={music.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors duration-300 ${
                  selectedMusic?.id === music.id
                    ? 'bg-primary/10 hover:bg-primary/20'
                    : 'bg-accent/50 hover:bg-accent/70'
                }`}
                onClick={() => handleMusicSelect(music)}
              >
                <div className="text-3xl">{music.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{music.title}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {music.type}
                  </div>
                </div>
                {selectedMusic?.id === music.id && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayStateChange(!isPlaying);
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {selectedMusic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="hover:bg-accent/50"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
              </div>
              <audio
                ref={audioRef}
                src={selectedMusic.url}
                loop
                preload="auto"
                className="hidden"
              />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 