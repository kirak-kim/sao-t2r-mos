import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  listeners: {
    id: string;
    created_at: string;
    user_agent: string;
    passed_headphone_check: boolean;
    trial_order: string; // JSON stringified
  };
  trials: {
    id: string;
    listener_id: string;
    trial_index: number;
    is_practice: boolean;
    room: string;
    condition: string;
    scene_match: number;
    quality: number;
    wet_play_count: number;
    time_spent_ms: number;
    created_at: string;
  };
};

export async function createListener(data: {
  userAgent: string;
  passedHeadphoneCheck: boolean;
  trialOrder: string;
  ageRange?: string;
  gender?: string;
  audioBackground?: string;
}): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('listeners')
    .insert({
      user_agent: data.userAgent,
      passed_headphone_check: data.passedHeadphoneCheck,
      trial_order: data.trialOrder,
      age_range: data.ageRange ?? null,
      gender: data.gender ?? null,
      audio_background: data.audioBackground ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('createListener error:', error);
    return null;
  }
  return row.id;
}

export async function saveTrial(data: {
  listenerId: string;
  trialIndex: number;
  isPractice: boolean;
  room: string;
  condition: string;
  sceneMatch: number;
  quality: number;
  wetPlayCount: number;
  timeSpentMs: number;
}): Promise<boolean> {
  const { error } = await supabase.from('trials').insert({
    listener_id: data.listenerId,
    trial_index: data.trialIndex,
    is_practice: data.isPractice,
    room: data.room,
    condition: data.condition,
    scene_match: data.sceneMatch,
    quality: data.quality,
    wet_play_count: data.wetPlayCount,
    time_spent_ms: data.timeSpentMs,
  });

  if (error) {
    console.error('saveTrial error:', error);
    return false;
  }
  return true;
}
