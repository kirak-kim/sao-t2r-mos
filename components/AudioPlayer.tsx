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
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [progress, setProgress] = useState(0);

  // Wire up Web Audio API on mount to ensure mono → both ears
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    source.connect(ctx.destination);

    return () => {
      ctx.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Resume AudioContext if suspended (browser autoplay policy)
      ctxRef.current?.resume();
      onPlay?.();
      audio.play();
      setPlaying(true);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    const next = playCount + 1;
    setPlayCount(next);
    onPlayCountChange?.(next);
    setProgress(0);
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
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={disabled || exhausted}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors
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
