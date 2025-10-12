-- Add date and time columns to custom_experiences table
ALTER TABLE public.custom_experiences 
ADD COLUMN experience_date DATE,
ADD COLUMN experience_time TIME;