import React from 'react';
import { Card } from '@/components/ui/card';

interface TimerProps {
  elapsedTime: number;
  onReset?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ elapsedTime, onReset }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-medium">Time Elapsed:</span>
        <span className="text-lg font-mono">{formatTime(elapsedTime)}</span>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          Reset
        </button>
      )}
    </Card>
  );
}; 