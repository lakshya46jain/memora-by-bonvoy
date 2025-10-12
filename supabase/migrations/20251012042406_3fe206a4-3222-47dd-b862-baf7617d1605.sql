-- Create storage bucket for memory photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memory-photos',
  'memory-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
);

-- RLS Policies for memory-photos bucket
CREATE POLICY "Users can view all memory photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'memory-photos');

CREATE POLICY "Users can upload their own memory photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memory-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own memory photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'memory-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own memory photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'memory-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);