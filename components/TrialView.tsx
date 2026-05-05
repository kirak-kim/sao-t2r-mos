'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import LikertScale from './LikertScale';
import AudioPlayer from './AudioPlayer';
import ProgressBar from './ProgressBar';
import { Trial } from '@/lib/stimuli';

const MAX_WET_PLAYS = 3;

interface TrialViewProps {
  trial: Trial;
  trialNumber: number;   // 1-based display number
  totalTrials: number;
  isPractice: boolean;
  debugMode: boolean;
  onSubmit: (data: { sceneMatch: number; quality: number; wetPlayCount: number; timeSpentMs: number }) => Promise<void>;
}

export default function TrialView({
  trial,
  trialNumber,
  totalTrials,
  isPractice,
  debugMode,
  onSubmit,
}: TrialViewProps) {
  const [sceneMatch, setSceneMatch] = useState<number | null>(null);
  const [quality, setQuality] = useState<number | null>(null);
  const [wetPlayCount, setWetPlayCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Stop callbacks for mutual exclusion between players
  const stopDryRef = useRef<(() => void) | null>(null);
  const stopWetRef = useRef<(() => void) | null>(null);

  // Reset state when trial changes
  useEffect(() => {
    setSceneMatch(null);
    setQuality(null);
    setWetPlayCount(0);
    startTimeRef.current = Date.now();
    stopDryRef.current = null;
    stopWetRef.current = null;
  }, [trial]);

  const registerDryStop = useCallback((fn: () => void) => {
    stopDryRef.current = fn;
  }, []);

  const registerWetStop = useCallback((fn: () => void) => {
    stopWetRef.current = fn;
  }, []);

  const handleDryPlay = useCallback(() => { stopWetRef.current?.(); }, []);
  const handleWetPlay = useCallback(() => { stopDryRef.current?.(); }, []);

  const canSubmit = sceneMatch !== null && quality !== null;

  const handleNext = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({
      sceneMatch: sceneMatch!,
      quality: quality!,
      wetPlayCount,
      timeSpentMs: Date.now() - startTimeRef.current,
    });
    setSubmitting(false);
  };

  const roomFolder = trial.room.id;
  const imgSrc = `/stimuli/${roomFolder}/room_image.jpg`;
  const drySrc = `/stimuli/${roomFolder}/dry.wav`;
  // Wet audio src is served through an API to keep condition hidden
  const wetSrc = `/api/audio?room=${encodeURIComponent(roomFolder)}&id=${trial.audioId}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {isPractice && (
          <div className="mb-4 text-sm bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-2 text-center">
            연습 단계입니다 — 결과는 저장되지 않습니다
          </div>
        )}

        <div className="mb-4">
          <ProgressBar current={trialNumber} total={totalTrials} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Room image */}
          <div className="w-full bg-gray-100">
            <Image
              src={imgSrc}
              alt="공간 이미지"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
              priority
            />
          </div>

          {debugMode && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800 font-mono">
              <strong>🐛 Debug:</strong> condition=<strong>{trial.condition}</strong> | room={trial.room.id}
              <div className="mt-1 text-gray-600 font-sans font-normal">{trial.room.caption}</div>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Dry audio */}
            <AudioPlayer
              key={`dry-${trial.room.id}-${trial.condition}`}
              src={drySrc}
              label="참고 음원 (공간 음향 없음)"
              registerStop={registerDryStop}
              onPlay={handleDryPlay}
            />

            {/* Wet audio */}
            <AudioPlayer
              key={`wet-${trial.room.id}-${trial.condition}`}
              src={wetSrc}
              label="평가 음원 (공간 음향 적용)"
              maxPlays={MAX_WET_PLAYS}
              onPlayCountChange={setWetPlayCount}
              registerStop={registerWetStop}
              onPlay={handleWetPlay}
            />

            <div className="border-t pt-4 space-y-6">
              <LikertScale
                question="Q1. 위 이미지의 공간에서 실제로 녹음된 것처럼 들리나요?"
                anchorLeft="전혀 그렇지 않다"
                anchorRight="매우 그렇다"
                value={sceneMatch}
                onChange={setSceneMatch}
              />
              <LikertScale
                question="Q2. 음질이 자연스럽고 artifact 없이 들리나요?"
                subtext="Artifact: 지직거림, 금속성 울림, 이상한 노이즈 등 부자연스러운 소리"
                anchorLeft="매우 부자연스럽다"
                anchorRight="매우 자연스럽다"
                value={quality}
                onChange={setQuality}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!canSubmit || submitting}
              className={`w-full py-3 rounded-xl font-semibold text-base transition-colors mt-2
                ${canSubmit && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {submitting ? '저장 중...' : isPractice && trialNumber === totalTrials ? '연습 완료 →' : '다음 →'}
            </button>

            {!canSubmit && (
              <p className="text-xs text-gray-400 text-center">두 질문 모두 응답해야 다음으로 넘어갈 수 있습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
