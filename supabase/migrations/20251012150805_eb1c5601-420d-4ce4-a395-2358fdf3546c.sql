-- Add UPDATE policy for liked_recommendations so users can update their own recommendations
CREATE POLICY "Users can update their own liked recommendations" 
ON liked_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);