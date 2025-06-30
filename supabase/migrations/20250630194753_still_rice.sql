/*
  # Fix User Profile Creation and Pipeline Stage Issues

  1. Updates
    - Fix pipeline stages creation function
    - Add auto-profile creation trigger for auth.users
    - Backfill missing pipeline stages for existing recruiters
    - Update completion scores

  2. Functions
    - create_default_pipeline_stages() - Creates all 7 pipeline stages
    - handle_new_user() - Auto-creates profiles for new users

  3. Triggers
    - on_auth_user_created - Creates profile when user signs up
    - create_default_pipeline_stages_trigger - Creates pipeline stages for recruiters
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_default_pipeline_stages_trigger ON profiles;

-- Update the pipeline stages creation function with better error handling
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create stages for recruiters
  IF NEW.role = 'recruiter' THEN
    -- Insert all default stages
    INSERT INTO pipeline_stages (recruiter_id, stage_name, stage_order, stage_color, auto_email_template) VALUES
    (NEW.id, 'Applied', 1, '#3b82f6', 'Thank you for your application. We have received your profile and will review it shortly.'),
    (NEW.id, 'Screening', 2, '#f59e0b', 'Congratulations! Your profile has passed our initial review. We would like to schedule a screening call with you.'),
    (NEW.id, 'Interview', 3, '#8b5cf6', 'Great news! We would like to invite you for an interview. Please let us know your availability for the coming week.'),
    (NEW.id, 'Final Review', 4, '#f97316', 'You have progressed to our final review stage. We will be in touch with next steps within 2-3 business days.'),
    (NEW.id, 'Offer', 5, '#10b981', 'Excellent! We are pleased to extend you an offer. Please review the attached details and let us know if you have any questions.'),
    (NEW.id, 'Hired', 6, '#059669', 'Welcome to the team! We are excited to have you on board. HR will be in touch with onboarding details.'),
    (NEW.id, 'Rejected', 7, '#ef4444', 'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.');
    
    -- Log successful creation
    RAISE NOTICE 'Created default pipeline stages for recruiter: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the profile creation
    RAISE WARNING 'Failed to create default pipeline stages for recruiter %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_default_pipeline_stages_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();

-- Create missing pipeline stages for existing recruiters
INSERT INTO pipeline_stages (recruiter_id, stage_name, stage_order, stage_color, auto_email_template)
SELECT 
  p.id,
  stage_data.stage_name,
  stage_data.stage_order,
  stage_data.stage_color,
  stage_data.auto_email_template
FROM profiles p
CROSS JOIN (
  VALUES 
    ('Applied', 1, '#3b82f6', 'Thank you for your application. We have received your profile and will review it shortly.'),
    ('Screening', 2, '#f59e0b', 'Congratulations! Your profile has passed our initial review. We would like to schedule a screening call with you.'),
    ('Interview', 3, '#8b5cf6', 'Great news! We would like to invite you for an interview. Please let us know your availability for the coming week.'),
    ('Final Review', 4, '#f97316', 'You have progressed to our final review stage. We will be in touch with next steps within 2-3 business days.'),
    ('Offer', 5, '#10b981', 'Excellent! We are pleased to extend you an offer. Please review the attached details and let us know if you have any questions.'),
    ('Hired', 6, '#059669', 'Welcome to the team! We are excited to have you on board. HR will be in touch with onboarding details.'),
    ('Rejected', 7, '#ef4444', 'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.')
) AS stage_data(stage_name, stage_order, stage_color, auto_email_template)
WHERE p.role = 'recruiter'
AND NOT EXISTS (
  SELECT 1 FROM pipeline_stages ps 
  WHERE ps.recruiter_id = p.id 
  AND ps.stage_name = stage_data.stage_name
)
ON CONFLICT (recruiter_id, stage_name) DO NOTHING;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user if it doesn't exist
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'recruiter' -- Default role for this platform
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table to auto-create profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update completion scores for existing profiles
UPDATE profiles 
SET completion_score = calculate_sa_reelpass_score(id)
WHERE role = 'candidate';