'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import { createListener } from '@/lib/supabase';

const AGE_RANGES = ['10대', '20대', '30대', '40대', '50대 이상'];
const GENDERS = ['남성', '여성', '기타', '밝히고 싶지 않음'];
const AUDIO_BACKGROUNDS = [
  { value: 'naive', label: '비전공자 (음악/음향 관련 전공/직업 없음)' },
  { value: 'musician', label: '취미 음악인 (악기 연주, 작곡, 노래 등)' },
  { value: 'engineer', label: '음악/음향/오디오 전공자 또는 관련 종사자' },
];

export default function DemographicsPage() {
  const router = useRouter();
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [audioBackground, setAudioBackground] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) { router.push('/'); return; }
    setReady(true);
  }, [router]);

  const [loading, setLoading] = useState(false);
  const canSubmit = ageRange !== '' && gender !== '' && audioBackground !== '';

  const handleNext = async () => {
    const session = loadSession();
    if (!session) return;
    setLoading(true);

    const listenerId = await createListener({
      userAgent: navigator.userAgent,
      passedHeadphoneCheck: false,
      trialOrder: '',
      ageRange,
      gender,
      audioBackground,
    });

    if (!listenerId) {
      alert('세션을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    session.listenerId = listenerId;
    session.demographics = { ageRange, gender, audioBackground };
    saveSession(session);
    router.push('/headphone-check');
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">기본 정보 입력</h1>
          <p className="text-gray-500 text-sm">연구 분석을 위한 인구통계 정보입니다</p>
        </div>

        <div className="space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              연령대 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map(a => (
                <button
                  key={a}
                  onClick={() => setAgeRange(a)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${ageRange === a
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${gender === g
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Audio background */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              음악/음향 관련 배경 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {AUDIO_BACKGROUNDS.map(b => (
                <button
                  key={b.value}
                  onClick={() => setAudioBackground(b.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors
                    ${audioBackground === b.value
                      ? 'bg-blue-50 text-blue-800 border-blue-400 font-medium'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!canSubmit || loading}
          className={`w-full mt-8 py-3 rounded-xl font-semibold text-base transition-colors
            ${canSubmit && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {loading ? '준비 중...' : '다음 →'}
        </button>

        {!canSubmit && (
          <p className="text-xs text-gray-400 text-center mt-2">모든 항목을 선택해주세요</p>
        )}
      </div>
    </div>
  );
}
