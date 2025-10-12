-- Add verified field to liked_recommendations
ALTER TABLE liked_recommendations 
ADD COLUMN verified boolean DEFAULT false;

-- Create viewed_recommendations table to track what users have seen
CREATE TABLE viewed_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('liked', 'skipped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommendation_id)
);

-- Enable RLS
ALTER TABLE viewed_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for viewed_recommendations
CREATE POLICY "Users can view their own viewed recommendations"
  ON viewed_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own viewed recommendations"
  ON viewed_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create memory_capsule_entries table
CREATE TABLE memory_capsule_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  experience_id uuid NOT NULL,
  experience_title text NOT NULL,
  photos text[] DEFAULT '{}',
  note text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT at_least_photo_or_note CHECK (
    (photos IS NOT NULL AND array_length(photos, 1) > 0) OR 
    (note IS NOT NULL AND note != '')
  )
);

-- Enable RLS
ALTER TABLE memory_capsule_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memory_capsule_entries
CREATE POLICY "Users can view their own memory entries"
  ON memory_capsule_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory entries"
  ON memory_capsule_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory entries"
  ON memory_capsule_entries FOR UPDATE
  USING (auth.uid() = user_id);