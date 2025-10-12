-- Create liked_recommendations table to store user's liked recommendations
CREATE TABLE public.liked_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  rating NUMERIC,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.liked_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own liked recommendations"
ON public.liked_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liked recommendations"
ON public.liked_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked recommendations"
ON public.liked_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Create custom_experiences table for user-added experiences
CREATE TABLE public.custom_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_experiences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom experiences"
ON public.custom_experiences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom experiences"
ON public.custom_experiences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom experiences"
ON public.custom_experiences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom experiences"
ON public.custom_experiences
FOR DELETE
USING (auth.uid() = user_id);