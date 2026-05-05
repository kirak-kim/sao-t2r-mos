'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession } from '@/lib/session';

export default function ReadyPage() {
  const router = useRouter();

  useEffect(() => {
    const session = loadSession();
    if (!session) { router.push('/'); return; }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">연습 완료</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          이제 본 실험을 시작합니다.<br />
          총 28개의 음원을 평가합니다.<br /><br />
          볼륨은 지금부터 변경하지 마세요.
        </p>
        <button
          onClick={() => router.push('/trial')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          본 실험 시작
        </button>
      </div>
    </div>
  );
}
