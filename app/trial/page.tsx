'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import { saveTrial } from '@/lib/supabase';
import { AUDIO_ID_TO_CONDITION } from '@/lib/stimuli';
import TrialView from '@/components/TrialView';
import { Trial } from '@/lib/stimuli';

export default function TrialPage() {
  const router = useRouter();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [listenerId, setListenerId] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) { router.push('/'); return; }
    setTrials(session.trials);
    setCurrentIdx(session.currentTrialIndex);
    setListenerId(session.listenerId);
    setDebugMode(session.debugMode);
    setReady(true);
  }, [router]);

  const handleSubmit = async (data: {
    sceneMatch: number;
    quality: number;
    wetPlayCount: number;
    timeSpentMs: number;
  }) => {
    const trial = trials[currentIdx];
    const condition = AUDIO_ID_TO_CONDITION[trial.audioId];

    // Save to Supabase
    let saved = await saveTrial({
      listenerId,
      trialIndex: currentIdx,
      isPractice: false,
      room: trial.room.id,
      condition,
      sceneMatch: data.sceneMatch,
      quality: data.quality,
      wetPlayCount: data.wetPlayCount,
      timeSpentMs: data.timeSpentMs,
    });

    // Fallback: localStorage backup
    if (!saved) {
      const backup = JSON.parse(localStorage.getItem('mos_backup') || '[]');
      backup.push({ listenerId, trialIndex: currentIdx, ...data, condition, room: trial.room.id });
      localStorage.setItem('mos_backup', JSON.stringify(backup));
    }

    const nextIdx = currentIdx + 1;
    const session = loadSession();
    if (session) {
      session.currentTrialIndex = nextIdx;
      saveSession(session);
    }

    if (nextIdx >= trials.length) {
      router.push('/complete');
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  if (!ready || trials.length === 0) return null;

  return (
    <TrialView
      trial={trials[currentIdx]}
      trialNumber={currentIdx + 1}
      totalTrials={trials.length}
      isPractice={false}
      debugMode={debugMode}
      onSubmit={handleSubmit}
    />
  );
}
