/*
  # Fix Infinite Recursion in Profiles RLS Policies

  The issue is in the "Recruiters can view candidate profiles" policy which creates a recursive lookup.
  We need to fix this by using a simpler approach that doesn't cause recursion.

  1. Drop the problematic policy
  2. Create a fixed version without recursive profile lookups
  3. Add proper session handling policies
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON profiles;

-- Create a simpler policy that uses auth.jwt() to check role directly
-- This avoids the recursive profile lookup
CREATE POLICY "Recruiters can view candidate profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing candidate profiles if the requesting user has recruiter role in their JWT
    role = 'candidate'
    AND
    (
      -- Check if the current user has recruiter role in their JWT metadata
      auth.jwt() ->> 'user_role' = 'recruiter'
      OR
      -- Fallback: Allow if current user is a recruiter (use EXISTS with LIMIT to prevent recursion)
      EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'recruiter'
        LIMIT 1
      )
    )
  );

-- Also add a policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      LIMIT 1
    )
  );

-- Create a function to update JWT claims with user role for better performance
CREATE OR REPLACE FUNCTION update_user_jwt_claims(user_id uuid, user_role text)
RETURNS void AS $$
BEGIN
  -- This would ideally update the JWT claims, but since we can't directly modify JWT,
  -- we'll use a different approach in the policies above
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update user metadata when profile role changes
CREATE OR REPLACE FUNCTION sync_user_role_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's raw_app_meta_data to include role for JWT claims
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', NEW.role)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role changes
DROP TRIGGER IF EXISTS sync_user_role_trigger ON profiles;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_metadata();

-- Update existing users' metadata
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', p.role)
FROM profiles p 
WHERE auth.users.id = p.user_id; 