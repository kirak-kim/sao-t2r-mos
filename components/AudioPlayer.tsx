'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  src: string;
  label: string;
  maxPlays?: number;
  onPlayCountChange?: (count: number) => void;
  disabled?: boolean;
  onPlay?: () => void;
  registerStop?: (fn: () => void) => void;
}

export default function AudioPlayer({
  src,
  label,
  maxPlays,
  onPlayCountChange,
  disabled = false,
  onPlay,
  registerStop,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const restartedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setPlayCount(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    registerStop?.(stop);
  }, [registerStop, stop]);

  const exhausted = maxPlays !== undefined && playCount >= maxPlays;

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (exhausted) return;
      onPlay?.();
      audio.play();
      setPlaying(true);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio || exhausted) return;
    onPlay?.();
    restartedRef.current = true;
    audio.currentTime = 0;
    audio.play();
    setPlaying(true);
    const next = playCount + 1;
    setPlayCount(next);
    onPlayCountChange?.(next);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    // restart already counted; only count on natural end
    if (restartedRef.current) {
      restartedRef.current = false;
      return;
    }
    const next = playCount + 1;
    setPlayCount(next);
    onPlayCountChange?.(next);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration > 0) setProgress((currentTime / duration) * 100);
  };

  return (
    <div className={`rounded-lg border p-3 ${disabled ? 'opacity-40' : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
      />
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={handleToggle}
          disabled={disabled || exhausted}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors shrink-0
            ${exhausted || disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {playing ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        {/* Restart */}
        <button
          onClick={handleRestart}
          disabled={disabled || exhausted}
          title="처음부터 다시 듣기"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
            ${exhausted || disabled ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {maxPlays !== undefined && (
              <span className={`text-xs ${exhausted ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                {exhausted ? '재생 완료' : `재생 ${playCount} / ${maxPlays}`}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      {exhausted && (
        <p className="text-xs text-red-500 mt-2">최대 재생 횟수에 도달했습니다.</p>
      )}
    </div>
  );
}
