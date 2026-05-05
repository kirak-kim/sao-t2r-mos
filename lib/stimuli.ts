export type Condition = 'gt' | 'ours' | 'scratch' | 'image2reverb';

export interface Room {
  id: string;       // folder name under public/stimuli/
  displayName: string;
  caption: string;
}

export interface Trial {
  room: Room;
  condition: Condition;
  audioId: string;  // opaque id, maps to actual condition server-side only
}

export const ROOMS: Room[] = [
  {
    id: 'BUT__CR2__cap001',
    displayName: 'Room 1',
    caption: 'A medium enclosed rectangular space with moderate absorption walls. The floor is carpeted with moderate to high absorption. The ceiling consists of wooden slats with low absorption. Large windows covered with curtains are present. The space is moderately furnished with tables and chairs, acting as absorbers and diffusers, and features a projector screen and wall-mounted speakers. This space sounds moderately reverberant with a warm character, suitable for presentations.',
  },
  {
    id: 'OpenAIR__02_Forest-in-WheldrakeWood__cap000',
    displayName: 'Room 2',
    caption: 'An outdoor natural environment with scattered trees and vegetation providing minimal acoustic boundaries. The ground consists of soft organic material. Sound disperses freely in multiple directions with minimal reflections. This space sounds open and free with a short decay and strong direct sound.',
  },
  {
    id: 'OpenAIR__07_creswell-crags__outside__cap000',
    displayName: 'Room 3',
    caption: 'An outdoor rocky gorge environment with high stone walls on both sides. The hard parallel rock surfaces create strong reflections. The open top allows sound to escape upward. This space sounds semi-enclosed with a distinct echo character.',
  },
  {
    id: 'OpenAIR__14_gill-heads-mine__site2__cap003',
    displayName: 'Room 4',
    caption: 'An underground mine tunnel with hard stone walls, floor, and ceiling. The narrow corridor shape creates strong parallel reflections and long reverberation. The space sounds highly reverberant and echoey with a bright metallic character.',
  },
  {
    id: 'OpenAIR__15_hamilton-mausoleum__cap000',
    displayName: 'Room 5',
    caption: 'A large stone mausoleum with very hard reflective surfaces throughout. The domed or vaulted ceiling creates diffuse reflections. The massive stone walls provide extremely long reverberation times. This space sounds immensely reverberant with a grand and resonant character.',
  },
  {
    id: 'OpenAIR__17_hoffmann-lime-kiln-langcliffeuk__cap001',
    displayName: 'Room 6',
    caption: 'A cylindrical or dome-shaped industrial kiln structure with hard brick or stone walls. The curved geometry creates unique reflection patterns. This space sounds highly reverberant with a round and focused acoustic character.',
  },
  {
    id: 'OpenAIR__42_dixon-studio-theatre-university-york__cap000',
    displayName: 'Room 7',
    caption: 'A small studio theatre with treated acoustic panels on walls. The ceiling is of moderate height with some absorption material. The space is designed for intimate performances. This space sounds moderately live with controlled reverberation and good clarity.',
  },
];

export const CONDITIONS: Condition[] = ['gt', 'ours', 'scratch', 'image2reverb'];

// Opaque audio IDs — condition is never revealed client-side
const AUDIO_ID_MAP: Record<Condition, string> = {
  gt: 'a1b2c3d4',
  ours: 'e5f6g7h8',
  scratch: 'i9j0k1l2',
  image2reverb: 'm3n4o5p6',
};

// Reverse map used only in the API route (server-side)
export const AUDIO_ID_TO_CONDITION: Record<string, Condition> = Object.fromEntries(
  Object.entries(AUDIO_ID_MAP).map(([k, v]) => [v, k as Condition])
);

export function getAudioId(condition: Condition): string {
  return AUDIO_ID_MAP[condition];
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate 28 trials with no consecutive same-room constraint
export function generateTrialOrder(): Trial[] {
  const allTrials: Trial[] = ROOMS.flatMap(room =>
    CONDITIONS.map(condition => ({
      room,
      condition,
      audioId: getAudioId(condition),
    }))
  );

  let trials = shuffle(allTrials);

  // Swap-based fix for consecutive same-room
  for (let i = 1; i < trials.length; i++) {
    if (trials[i].room.id === trials[i - 1].room.id) {
      for (let j = i + 1; j < trials.length; j++) {
        const prevOk = trials[j].room.id !== trials[i - 1].room.id;
        const nextOk = j === trials.length - 1 || trials[j].room.id !== trials[i + 1]?.room.id;
        const swapBackOk = j + 1 >= trials.length || trials[i].room.id !== trials[j - 1]?.room.id;
        if (prevOk && nextOk && swapBackOk) {
          [trials[i], trials[j]] = [trials[j], trials[i]];
          break;
        }
      }
    }
  }

  return trials;
}

export function getPracticeTrials(): Trial[] {
  // 2 practice trials from first 2 rooms, 2 different conditions
  return [
    { room: ROOMS[0], condition: 'gt', audioId: getAudioId('gt') },
    { room: ROOMS[1], condition: 'ours', audioId: getAudioId('ours') },
  ];
}
