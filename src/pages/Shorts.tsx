import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface Short {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  publishedAt: string;
  views: number;
}

const Shorts: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/shorts')
      .then(res => {
        console.log('Shorts API response:', res.data);
        setShorts(res.data as Short[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching shorts:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPlaying(false); // Reset playing state when current changes
  }, [current]);

  // Keyboard navigation (up/down arrows)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setCurrent(c => Math.min(c + 1, shorts.length - 1));
    } else if (e.key === 'ArrowUp') {
      setCurrent(c => Math.max(c - 1, 0));
    }
  }, [shorts.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 animate-fade-in">
        <div className="text-xl font-bold text-red-600">Loading Shorts...</div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 animate-fade-in">
        <div className="text-lg text-neutral-700">No shorts found.</div>
      </div>
    );
  }

  const short = shorts[current];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 animate-fade-in py-8">
      <h1 className="text-3xl font-extrabold text-red-600 mb-6">BridgeLab Shorts</h1>
      <div className="relative flex flex-col items-center w-full max-w-xs">
        {/* Shorts Card */}
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col items-center w-full aspect-[9/16] max-h-[80vh] overflow-hidden relative">
          {/* Only Video, no overlays or buttons */}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${short.videoId}?autoplay=1&modestbranding=1&controls=1&rel=0`}
            title={short.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover"
            style={{ aspectRatio: '9/16', minHeight: '100%' }}
          />
        </div>
        {/* Navigation Buttons */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 text-2xl font-bold text-red-500 hover:bg-red-100 transition disabled:opacity-30"
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          disabled={current === 0}
          aria-label="Previous Short"
        >
          &#8593;
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full shadow p-2 text-2xl font-bold text-red-500 hover:bg-red-100 transition disabled:opacity-30"
          onClick={() => setCurrent(c => Math.min(c + 1, shorts.length - 1))}
          disabled={current === shorts.length - 1}
          aria-label="Next Short"
        >
          &#8595;
        </button>
      </div>
      <div className="mt-4 text-neutral-500 text-sm">{current + 1} / {shorts.length}</div>
    </div>
  );
};

export default Shorts;