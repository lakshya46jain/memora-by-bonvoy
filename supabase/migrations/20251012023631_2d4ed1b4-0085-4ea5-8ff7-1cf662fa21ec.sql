-- Add location and timestamp fields to memory_capsule_entries
ALTER TABLE memory_capsule_entries 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS experience_timestamp timestamp with time zone;

-- Add index for faster chronological ordering
CREATE INDEX IF NOT EXISTS idx_memory_capsule_timestamp 
ON memory_capsule_entries(experience_timestamp);

-- Update RLS policies to allow delete
DROP POLICY IF EXISTS "Users can delete their own memory entries" ON memory_capsule_entries;
CREATE POLICY "Users can delete their own memory entries"
ON memory_capsule_entries
FOR DELETE
USING (auth.uid() = user_id);