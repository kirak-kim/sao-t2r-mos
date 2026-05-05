-- Run this in your Supabase SQL editor

CREATE TABLE listeners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  passed_headphone_check BOOLEAN,
  trial_order TEXT,
  age_range TEXT,
  gender TEXT,
  audio_background TEXT
);

CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id UUID REFERENCES listeners(id),
  trial_index INTEGER,
  is_practice BOOLEAN DEFAULT FALSE,
  room TEXT NOT NULL,
  condition TEXT NOT NULL,
  scene_match INTEGER CHECK (scene_match BETWEEN 1 AND 5),
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  wet_play_count INTEGER,
  time_spent_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 INSERT만 허용 (SELECT/UPDATE/DELETE 불가)
CREATE POLICY "Anyone can insert listener" ON listeners
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can insert trial" ON trials
  FOR INSERT TO anon WITH CHECK (true);
