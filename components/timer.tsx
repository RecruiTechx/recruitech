'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  onPause?: () => void;
}

/**
 * Timer component for programming test
 * Displays countdown with formatted HH:MM:SS
 */
export function Timer({ initialSeconds, onTimeUp, onPause }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsActive(false);
            onTimeUp?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onTimeUp]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const isWarning = seconds < 300; // Less than 5 minutes
  const isCritical = seconds < 60; // Less than 1 minute

  return (
    <div className="flex items-center gap-4">
      <div
        className={`text-4xl font-bold font-mono ${
          isCritical
            ? 'text-red-600 animate-pulse'
            : isWarning
              ? 'text-orange-600'
              : 'text-foreground'
        }`}
      >
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
        {String(secs).padStart(2, '0')}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            onPause?.();
          }}
          className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 transition text-sm font-medium"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
