-- Fix the profiles table Row Level Security (RLS) policies
-- This allows users to insert their own profile and fixes the error during signup

-- First, we need to drop any conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a policy that allows users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify existing policies are still in place
-- These should already exist but we'll ensure they're there
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles" ON profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Add a policy that allows deleting one's own profile (optional)
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles 
FOR DELETE USING (auth.uid() = id); 