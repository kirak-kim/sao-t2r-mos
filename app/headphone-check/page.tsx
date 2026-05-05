'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';

type Side = 'left' | 'right';

interface CheckItem {
  side: Side;
  answered: Side | null;
}

const TOTAL_CHECKS = 3;

function generateChecks(): CheckItem[] {
  const sides: Side[] = ['left', 'right', 'left', 'right'];
  const shuffled = [...sides].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL_CHECKS).map(side => ({ side, answered: null }));
}

export default function HeadphoneCheckPage() {
  const router = useRouter();
  const [checks] = useState<CheckItem[]>(() => generateChecks());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);

  // Create AudioContext on first user interaction so it's already running when playTone is called
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    return () => { ctxRef.current?.close(); };
  }, []);

  const playTone = useCallback((side: Side) => {
    if (playing) return;
    setPlaying(true);

    const ctx = ensureCtx();

    const playNow = () => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const merger = ctx.createChannelMerger(2);

      osc.frequency.value = 440;
      osc.type = 'sine';
      gainNode.gain.value = 0.5;

      if (side === 'left') {
        osc.connect(gainNode);
        gainNode.connect(merger, 0, 0);
        const silent = ctx.createGain();
        silent.gain.value = 0;
        silent.connect(merger, 0, 1);
      } else {
        osc.connect(gainNode);
        gainNode.connect(merger, 0, 1);
        const silent = ctx.createGain();
        silent.gain.value = 0;
        silent.connect(merger, 0, 0);
      }

      merger.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
      osc.onended = () => setPlaying(false);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(playNow);
    } else {
      playNow();
    }
  }, [playing, ensureCtx]);

  const handleAnswer = (answer: Side) => {
    const check = checks[currentIdx];
    const correct = answer === check.side;

    if (!correct) {
      setFailCount(prev => prev + 1);
      setFailed(true);
      return;
    }

    if (currentIdx + 1 >= TOTAL_CHECKS) {
      const session = loadSession();
      if (session) {
        session.headphoneCheckPassed = true;
        saveSession(session);
      }
      router.push('/calibration');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setFailed(false);
    setCurrentIdx(0);
  };

  if (failed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">🎧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">헤드폰을 확인해주세요</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            소리가 어느 쪽 귀에서 들리는지 정확히 들리지 않았습니다.
            헤드폰이 올바르게 착용되어 있는지, 좌우가 바뀌지는 않았는지 확인해주세요.
            조용한 환경에서 다시 시도해주세요.
          </p>
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const current = checks[currentIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎧</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">헤드폰 착용 확인</h1>
          <p className="text-gray-500 text-sm">{currentIdx + 1} / {TOTAL_CHECKS}</p>
        </div>

        <p className="text-sm text-gray-700 text-center mb-6 leading-relaxed">
          아래 버튼을 눌러 소리를 재생하고, 소리가 어느 쪽 귀에서 들렸는지 선택해주세요.
        </p>

        <button
          onClick={() => playTone(current.side)}
          disabled={playing}
          className={`w-full py-3 mb-6 rounded-xl font-semibold transition-colors
            ${playing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
        >
          {playing ? '재생 중...' : '▶ 소리 재생'}
        </button>

        <p className="text-sm font-medium text-gray-700 text-center mb-4">소리가 어느 쪽에서 들렸나요?</p>

        <div className="flex gap-4">
          <button
            onClick={() => handleAnswer('left')}
            disabled={playing}
            className="flex-1 py-3 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl font-semibold text-gray-700 transition-colors disabled:opacity-40"
          >
            👂 왼쪽
          </button>
          <button
            onClick={() => handleAnswer('right')}
            disabled={playing}
            className="flex-1 py-3 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl font-semibold text-gray-700 transition-colors disabled:opacity-40"
          >
            오른쪽 👂
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          소리를 듣기 전에 버튼을 클릭하지 마세요
        </p>
      </div>
    </div>
  );
}
