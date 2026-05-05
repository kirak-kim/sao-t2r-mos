'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import { ROOMS } from '@/lib/stimuli';

export default function CalibrationPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const drySrc = `/stimuli/${ROOMS[0].id}/dry.wav`;

  const handlePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      setPlayed(true);
    }
  };

  const handleEnded = () => setPlaying(false);

  const handleNext = () => {
    const session = loadSession();
    if (session) {
      session.calibrationDone = true;
      saveSession(session);
    }
    router.push('/practice');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔊</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">볼륨 조절</h1>
        </div>

        <div className="space-y-4 text-sm text-gray-700 mb-6 leading-relaxed">
          <p>
            아래 샘플 음원을 재생하여 <strong>편안하게 들을 수 있는 볼륨</strong>으로 조절해주세요.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
            ⚠️ 볼륨을 설정한 후에는 <strong>실험이 끝날 때까지 볼륨을 변경하지 마세요.</strong>
          </div>
        </div>

        <audio ref={audioRef} src={drySrc} onEnded={handleEnded} preload="auto" />

        <button
          onClick={handlePlay}
          className={`w-full py-3 mb-6 rounded-xl font-semibold transition-colors
            ${playing ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
        >
          {playing ? '■ 정지' : '▶ 샘플 재생'}
        </button>

        <button
          onClick={handleNext}
          disabled={!played}
          className={`w-full py-3 rounded-xl font-semibold transition-colors
            ${played ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          볼륨 설정 완료 →
        </button>

        {!played && (
          <p className="text-xs text-gray-400 text-center mt-3">샘플을 먼저 재생해주세요</p>
        )}
      </div>
    </div>
  );
}
