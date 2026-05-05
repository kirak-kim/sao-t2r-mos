'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, saveSession, createSession } from '@/lib/session';

export default function WelcomePage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    clearSession();
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    setIsMobile(mobile);
    const params = new URLSearchParams(window.location.search);
    setDebugMode(params.get('debug') === '1');
  }, []);

  const handleStart = () => {
    if (!agreed) return;
    // Create a temporary session with empty listenerId; demographics page will create the DB record
    createSession('pending', debugMode);
    router.push('/demographics');
  };

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🖥️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">데스크탑/노트북에서 접속해주세요</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            본 실험은 노트북 또는 데스크탑 + 헤드폰/이어폰 환경에서만 진행 가능합니다.
            스마트폰, 태블릿, 스피커로는 참여하실 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            실내 음향 생성 AI 평가 실험에 참여해주세요
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">약 25~30분 소요</p>

          <div className="space-y-5 text-sm leading-relaxed text-gray-700">
            <p>
              안녕하세요! 본 실험에 관심 가져주셔서 감사합니다. 저희는 공간 음향 생성 모델이 만들어낸 음향의 지각적 품질을 평가하기 위해 인간 대상 청취 평가를 진행하고 있습니다.
            </p>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">[실험 내용]</h2>
              <p>
                우리가 어떤 공간(예: 강당, 작은 방, 교회 등)에서 말을 할 때, 그 공간 특유의 울림이 소리에 더해집니다.
                이러한 울림을 "리버브(reverb, 잔향)"라고 하며, 이는 공간의 음향 특성을 구성하는 대표적인 요소입니다.
                본 실험에서는 공간 사진과, 그 공간의 음향 특성이 적용된 발화(speech) 음원을 함께 들려드립니다.
              </p>
              <p className="mt-2">각 음원에 대해 두 가지를 1~5점으로 평가해주시면 됩니다:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>
                  <strong>공간 일치도:</strong> 위 이미지의 공간에서 실제로 녹음된 것처럼 들리는가?
                  <br /><span className="text-gray-500 ml-5">(1점: 전혀 그렇지 않다 / 5점: 매우 그렇다)</span>
                </li>
                <li>
                  <strong>음질:</strong> 음질이 자연스럽고 합성된 듯한 거슬리는 소리(artifact)가 없는가?
                  <br /><span className="text-gray-500 ml-5">(1점: 매우 부자연스럽다 / 5점: 매우 자연스럽다)</span>
                </li>
              </ol>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">[참가 조건]</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>만 18세 이상</li>
                <li>정상 청력 (청력 관련 질환이 없으신 분)</li>
                <li>노트북 또는 데스크탑 + <strong>헤드폰/이어폰 필수</strong>
                  <br /><span className="text-gray-500 ml-5">(스마트폰/태블릿/스피커로는 진행 불가)</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">[평가 환경]</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>조용한 장소에서 진행해주세요</li>
                <li>시작 전 편안한 볼륨으로 조절하시고, 평가 중에는 볼륨을 변경하지 말아주세요</li>
                <li>약 25분 소요되며, <strong>한 번에 끝까지</strong> 진행 부탁드립니다</li>
                <li>Chrome 또는 Firefox 브라우저 권장</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">[참여 안내]</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>모든 응답은 익명으로 수집되며 연구 목적으로만 사용됩니다</li>
                <li>참여는 자발적이며 언제든 중단하실 수 있습니다</li>
                <li>끝까지 참여해주신 분께는 <strong>소정의 간식</strong>을 준비했습니다 🍪</li>
              </ul>
            </div>

            <p className="text-gray-400 text-xs">문의: kirak@kaist.ac.kr</p>
          </div>

          <div className="mt-8 border-t pt-6">
            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
              />
              <span className="text-sm text-gray-700">
                위 내용을 모두 확인했습니다. 헤드폰을 착용하고 조용한 환경에서 실험을 시작하겠습니다.
              </span>
            </label>

            {debugMode && (
              <div className="mb-4 text-xs bg-yellow-50 border border-yellow-300 text-yellow-800 rounded px-3 py-2">
                🐛 Debug 모드 활성화됨 — 각 trial에서 condition과 caption이 표시됩니다.
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!agreed}
              className={`w-full py-3 rounded-xl text-white font-semibold text-base transition-colors
                ${agreed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
