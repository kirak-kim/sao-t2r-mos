import { Trial, generateTrialOrder, getPracticeTrials } from './stimuli';

export interface Demographics {
  ageRange: string;
  gender: string;
  audioBackground: string;
}

export interface Session {
  listenerId: string;
  trials: Trial[];
  practiceTrials: Trial[];
  currentTrialIndex: number;
  practiceComplete: boolean;
  headphoneCheckPassed: boolean;
  calibrationDone: boolean;
  debugMode: boolean;
  demographics?: Demographics;
}

const KEY = 'mos_session';

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export function createSession(listenerId: string, debugMode = false): Session {
  const s: Session = {
    listenerId,
    trials: generateTrialOrder(),
    practiceTrials: getPracticeTrials(),
    currentTrialIndex: 0,
    practiceComplete: false,
    headphoneCheckPassed: false,
    calibrationDone: false,
    debugMode,
  };
  saveSession(s);
  return s;
}
