-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  bonvoy_points INTEGER DEFAULT 0 CHECK (bonvoy_points >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can view all profiles but only edit their own
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create consent_records table for Memora opt-in tracking
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stay_id TEXT,
  memora_enabled BOOLEAN DEFAULT false NOT NULL,
  consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address INET,
  two_factor_verified BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS on consent_records
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Consent policies: users can only see and manage their own consent records
CREATE POLICY "Users can view their own consent records"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent records"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent records"
  ON public.consent_records FOR UPDATE
  USING (auth.uid() = user_id);

-- Create privacy tiers enum
CREATE TYPE public.privacy_tier AS ENUM ('private', 'share_with_staff', 'share_with_partners');

-- Create privacy_preferences table
CREATE TABLE public.privacy_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stay_id TEXT,
  tier public.privacy_tier DEFAULT 'private' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, stay_id)
);

-- Enable RLS on privacy_preferences
ALTER TABLE public.privacy_preferences ENABLE ROW LEVEL SECURITY;

-- Privacy preferences policies
CREATE POLICY "Users can view their own privacy preferences"
  ON public.privacy_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy preferences"
  ON public.privacy_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy preferences"
  ON public.privacy_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_preferences_updated_at
  BEFORE UPDATE ON public.privacy_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();