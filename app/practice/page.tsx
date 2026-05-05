'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import TrialView from '@/components/TrialView';
import { Trial } from '@/lib/stimuli';

export default function PracticePage() {
  const router = useRouter();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) { router.push('/'); return; }
    setTrials(session.practiceTrials);
    setDebugMode(session.debugMode);
    setReady(true);
  }, [router]);

  const handleSubmit = async () => {
    if (currentIdx + 1 >= trials.length) {
      const session = loadSession();
      if (session) {
        session.practiceComplete = true;
        saveSession(session);
      }
      router.push('/ready');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  if (!ready || trials.length === 0) return null;

  return (
    <TrialView
      trial={trials[currentIdx]}
      trialNumber={currentIdx + 1}
      totalTrials={trials.length}
      isPractice={true}
      debugMode={debugMode}
      onSubmit={handleSubmit}
    />
  );
}
