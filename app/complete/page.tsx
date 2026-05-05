'use client';

import { useEffect } from 'react';
import { clearSession } from '@/lib/session';

export default function CompletePage() {
  useEffect(() => {
    clearSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">평가 완료!</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          참여해주셔서 진심으로 감사합니다.<br />
          소중한 평가가 연구에 큰 도움이 됩니다.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
          <p className="font-semibold mb-1">🍪 간식 수령 안내</p>
          <p className="leading-relaxed">
            이 화면을 스크린샷으로 찍어서<br />
            <strong>kirak@kaist.ac.kr</strong> 또는<br />
            카카오톡으로 보내주시면 간식을 드립니다!
          </p>
        </div>

        <p className="text-xs text-gray-400">
          창을 닫으셔도 됩니다.
        </p>
      </div>
    </div>
  );
}
