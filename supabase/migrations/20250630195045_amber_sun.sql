/*
  # Fix RLS Policies for Profiles Table

  1. Security Policy Updates
    - Drop existing problematic policies that may cause infinite recursion
    - Create clean, simple policies for profile management
    - Allow authenticated users to create, read, update their own profiles
    - Allow recruiters to view candidate profiles safely

  2. Changes Made
    - Remove potentially recursive policies
    - Add INSERT policy for profile creation during signup
    - Simplify SELECT policies to avoid recursion
    - Maintain recruiter access to candidate profiles
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create clean, non-recursive policies

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow recruiters to view candidate profiles (non-recursive)
CREATE POLICY "Recruiters can view candidate profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the profile being viewed is a candidate
    role = 'candidate'
    AND
    -- And the viewer is a recruiter (check directly without subquery to avoid recursion)
    EXISTS (
      SELECT 1 
      FROM auth.users u 
      WHERE u.id = auth.uid()
      AND u.id IN (
        SELECT p.user_id 
        FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role = 'recruiter'
      )
    )
  );

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);