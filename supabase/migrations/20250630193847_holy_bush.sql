/*
  # ReelHunter Core Database Schema
  
  This migration creates the complete database schema for ReelHunter,
  a recruiter platform focused on South African talent with government verification.
  
  ## Core Features:
  1. User profiles with role-based access (recruiters and candidates)
  2. Skills-first verification system (ReelPass)
  3. South African government integration
  4. Recruiter pipeline management
  5. Communication tracking
  6. Recruiter scorecard system
  7. Interview scheduling
  8. Live availability tracking
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'open', 'not-looking');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'expired', 'revoked');

-- South African specific types
CREATE TYPE sa_province AS ENUM (
  'eastern_cape',
  'free_state', 
  'gauteng',
  'kwazulu_natal',
  'limpopo',
  'mpumalanga',
  'northern_cape',
  'north_west',
  'western_cape'
);

CREATE TYPE sa_language AS ENUM (
  'afrikaans',
  'english',
  'ndebele',
  'northern_sotho',
  'sotho',
  'swazi',
  'tsonga',
  'tswana',
  'venda',
  'xhosa',
  'zulu'
);

CREATE TYPE bee_level AS ENUM (
  'level_1',
  'level_2',
  'level_3', 
  'level_4',
  'level_5',
  'level_6',
  'level_7',
  'level_8',
  'non_compliant'
);

-- Interview and pipeline types
CREATE TYPE interview_type AS ENUM ('video', 'phone', 'in-person');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');

-- =============================================
-- CORE TABLES
-- =============================================

-- User profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidate',
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  headline text,
  bio text,
  avatar_url text,
  
  -- Contact information
  phone text,
  location text,
  website text,
  linkedin_url text,
  github_url text,
  
  -- South African specific fields
  sa_id_number text,
  province sa_province,
  languages sa_language[],
  bee_status bee_level,
  work_permit_status text,
  tax_number text,
  
  -- Scoring and verification
  completion_score integer DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 100),
  reelpass_verified boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Skills table
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  proficiency text CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  verified boolean DEFAULT false,
  video_verified boolean DEFAULT false,
  video_demo_url text,
  years_experience integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  technologies text[],
  live_url text,
  github_url text,
  image_url text,
  start_date date,
  end_date date,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job postings table
CREATE TABLE job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements text,
  location text,
  employment_type text DEFAULT 'full-time',
  salary_min integer,
  salary_max integer,
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- AVAILABILITY AND COMMUNICATION
-- =============================================

-- Availability updates for live status tracking
CREATE TABLE availability_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  availability_status availability_status NOT NULL,
  available_from date,
  notice_period_days integer DEFAULT 0,
  salary_expectation_min integer,
  salary_expectation_max integer,
  preferred_work_type text CHECK (preferred_work_type IN ('remote', 'hybrid', 'onsite', 'flexible')),
  location_preferences text[],
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- PIPELINE MANAGEMENT
-- =============================================

-- Pipeline stages (customizable per recruiter)
CREATE TABLE pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  stage_color text DEFAULT '#6b7280',
  auto_email_template text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, stage_name),
  UNIQUE(recruiter_id, stage_order)
);

-- Candidate positions in recruitment pipeline
CREATE TABLE candidate_pipeline_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_posting_id uuid REFERENCES job_postings(id) ON DELETE SET NULL,
  current_stage_id uuid NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  previous_stage_id uuid REFERENCES pipeline_stages(id),
  moved_at timestamptz DEFAULT now(),
  moved_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Communication tracking
CREATE TABLE candidate_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  communication_type text NOT NULL CHECK (communication_type IN ('email', 'sms', 'call', 'system')),
  trigger_event text NOT NULL CHECK (trigger_event IN ('stage_move', 'manual', 'scheduled', 'availability_change')),
  subject text,
  message_content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivery_status text DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed', 'pending')),
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- INTERVIEW SCHEDULING
-- =============================================

-- Interviews table
CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  interview_type interview_type NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  interviewers text[] NOT NULL DEFAULT '{}',
  location text,
  notes text,
  timezone text NOT NULL DEFAULT 'UTC',
  meeting_url text,
  meeting_id text,
  status interview_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- RECRUITER SCORECARD SYSTEM
-- =============================================

-- Recruiter ratings from candidates
CREATE TABLE recruiter_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating integer NOT NULL CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  role_accuracy_rating integer NOT NULL CHECK (role_accuracy_rating >= 1 AND role_accuracy_rating <= 5),
  overall_rating numeric(2,1) GENERATED ALWAYS AS ((communication_rating + professionalism_rating + role_accuracy_rating) / 3.0) STORED,
  feedback_text text,
  job_title text,
  company_name text,
  is_public boolean DEFAULT true,
  is_disputed boolean DEFAULT false,
  dispute_reason text,
  dispute_details text,
  dispute_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- =============================================
-- SOUTH AFRICAN GOVERNMENT VERIFICATION
-- =============================================

-- SA Government verification types
CREATE TYPE sa_verification_type AS ENUM (
  'id_verification',
  'tax_clearance',
  'criminal_record', 
  'credit_check',
  'education_saqa',
  'professional_registration',
  'seta_certification',
  'bee_certificate'
);

CREATE TYPE sa_government_agency AS ENUM (
  'home_affairs',
  'sars',
  'saps', 
  'saqa',
  'department_labour',
  'department_education',
  'professional_councils',
  'seta_bodies',
  'bee_verification_agencies'
);

-- Main SA government verifications table
CREATE TABLE sa_government_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type sa_verification_type NOT NULL,
  agency sa_government_agency NOT NULL,
  verification_id text NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  verified_data jsonb DEFAULT '{}',
  verification_date timestamptz,
  expiry_date timestamptz,
  verification_score integer CHECK (verification_score >= 0 AND verification_score <= 100),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SA Identity verification (Home Affairs)
CREATE TABLE sa_identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  id_number text NOT NULL,
  id_type text NOT NULL DEFAULT 'south_african_id',
  verification_status verification_status NOT NULL DEFAULT 'pending',
  home_affairs_verified boolean DEFAULT false,
  biometric_verified boolean DEFAULT false,
  verification_reference text,
  verification_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SA Education verification (SAQA)
CREATE TABLE sa_education_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  qualification_title text NOT NULL,
  nqf_level integer CHECK (nqf_level >= 1 AND nqf_level <= 10),
  saqa_id text,
  qualification_type text,
  completion_date date,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  saqa_verified boolean DEFAULT false,
  institution_verified boolean DEFAULT false,
  verification_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SA Employment verification (SARS/DoL)
CREATE TABLE sa_employment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_name text NOT NULL,
  employer_registration_number text,
  job_title text NOT NULL,
  employment_start_date date NOT NULL,
  employment_end_date date,
  employment_type text DEFAULT 'permanent',
  salary_verified boolean DEFAULT false,
  uif_contributions_verified boolean DEFAULT false,
  tax_certificate_verified boolean DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  sars_reference text,
  dol_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SA Professional licenses
CREATE TABLE sa_professional_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_body text NOT NULL,
  license_type text NOT NULL,
  license_number text NOT NULL,
  registration_category text,
  issue_date date,
  expiry_date date,
  cpd_compliant boolean DEFAULT false,
  status verification_status NOT NULL DEFAULT 'pending',
  verification_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SETA skills development tracking
CREATE TABLE sa_seta_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seta_name text NOT NULL,
  qualification_title text NOT NULL,
  unit_standards text[],
  credits_achieved integer,
  completion_date date,
  certificate_number text,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  seta_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- BEE verification tracking
CREATE TABLE sa_bee_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bee_level bee_level NOT NULL,
  verification_agency text NOT NULL,
  certificate_number text,
  issue_date date,
  expiry_date date,
  ownership_score numeric(5,2),
  management_score numeric(5,2),
  skills_development_score numeric(5,2),
  enterprise_development_score numeric(5,2),
  socioeconomic_development_score numeric(5,2),
  total_score numeric(5,2),
  verification_status verification_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- REELPERSONA ASSESSMENT
-- =============================================

-- Persona analysis for soft skills assessment
CREATE TABLE persona_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_data jsonb NOT NULL DEFAULT '{}',
  work_style jsonb DEFAULT '{}',
  cultural_fit jsonb DEFAULT '{}',
  emotional_intelligence jsonb DEFAULT '{}',
  communication_style jsonb DEFAULT '{}',
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  analysis_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Core table indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_completion_score ON profiles(completion_score DESC);
CREATE INDEX idx_profiles_province ON profiles(province);
CREATE INDEX idx_profiles_bee_status ON profiles(bee_status);

CREATE INDEX idx_skills_profile_id ON skills(profile_id);
CREATE INDEX idx_skills_verified ON skills(verified);
CREATE INDEX idx_skills_video_verified ON skills(video_verified);

CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_projects_featured ON projects(is_featured);

CREATE INDEX idx_job_postings_recruiter_id ON job_postings(recruiter_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);

-- Availability and pipeline indexes
CREATE INDEX idx_availability_updates_profile_id ON availability_updates(profile_id);
CREATE INDEX idx_availability_updates_active ON availability_updates(is_active, availability_status);

CREATE INDEX idx_pipeline_stages_recruiter_id ON pipeline_stages(recruiter_id, stage_order);
CREATE INDEX idx_candidate_pipeline_positions_recruiter ON candidate_pipeline_positions(recruiter_id);
CREATE INDEX idx_candidate_pipeline_positions_candidate ON candidate_pipeline_positions(candidate_id);
CREATE INDEX idx_candidate_communications_recruiter ON candidate_communications(recruiter_id, sent_at DESC);

-- Interview and scorecard indexes
CREATE INDEX idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_candidate_email ON interviews(candidate_email);

CREATE INDEX idx_recruiter_scorecards_recruiter_id ON recruiter_scorecards(recruiter_id);
CREATE INDEX idx_recruiter_scorecards_overall_rating ON recruiter_scorecards(overall_rating DESC);

-- SA verification indexes
CREATE INDEX idx_sa_gov_verifications_profile_id ON sa_government_verifications(profile_id);
CREATE INDEX idx_sa_gov_verifications_type ON sa_government_verifications(verification_type);
CREATE INDEX idx_sa_gov_verifications_status ON sa_government_verifications(status);
CREATE INDEX idx_sa_identity_profile_id ON sa_identity_verifications(profile_id);
CREATE INDEX idx_sa_identity_id_number ON sa_identity_verifications(id_number);
CREATE INDEX idx_sa_education_profile_id ON sa_education_verifications(profile_id);
CREATE INDEX idx_sa_education_nqf ON sa_education_verifications(nqf_level);
CREATE INDEX idx_sa_employment_profile_id ON sa_employment_verifications(profile_id);
CREATE INDEX idx_sa_licenses_profile_id ON sa_professional_licenses(profile_id);
CREATE INDEX idx_sa_seta_profile_id ON sa_seta_certifications(profile_id);
CREATE INDEX idx_sa_bee_profile_id ON sa_bee_verifications(profile_id);

CREATE INDEX idx_persona_analyses_profile_id ON persona_analyses(profile_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_pipeline_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_government_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_education_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_employment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_professional_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_seta_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_bee_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_analyses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Recruiters can view candidate profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'candidate' AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- Skills policies
CREATE POLICY "Users can manage own skills"
  ON skills FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = skills.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view candidate skills"
  ON skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = skills.profile_id AND candidate.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- Projects policies
CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = projects.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view candidate projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = projects.profile_id AND candidate.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- Job postings policies
CREATE POLICY "Recruiters can manage own job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = job_postings.recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can view active job postings"
  ON job_postings FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'candidate'
    )
  );

-- Availability updates policies
CREATE POLICY "Users can manage own availability"
  ON availability_updates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = availability_updates.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can read candidate availability"
  ON availability_updates FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = availability_updates.profile_id AND candidate.role = 'candidate'
    )
  );

-- Pipeline stages policies
CREATE POLICY "Recruiters can manage own pipeline stages"
  ON pipeline_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = pipeline_stages.recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

-- Pipeline positions policies
CREATE POLICY "Recruiters can manage own pipeline"
  ON candidate_pipeline_positions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = candidate_pipeline_positions.recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can read own pipeline status"
  ON candidate_pipeline_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = candidate_pipeline_positions.candidate_id AND p.user_id = auth.uid() AND p.role = 'candidate'
    )
  );

-- Communications policies
CREATE POLICY "Recruiters can manage own communications"
  ON candidate_communications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = candidate_communications.recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can read communications sent to them"
  ON candidate_communications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = candidate_communications.candidate_id AND p.user_id = auth.uid() AND p.role = 'candidate'
    )
  );

-- Interviews policies
CREATE POLICY "Recruiters can manage own interviews"
  ON interviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = interviews.recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

-- Recruiter scorecards policies
CREATE POLICY "Public can read public scorecards"
  ON recruiter_scorecards FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Candidates can create scorecards"
  ON recruiter_scorecards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = candidate_id AND user_id = auth.uid() AND role = 'candidate'
    )
  );

CREATE POLICY "Users can read own scorecards"
  ON recruiter_scorecards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE (id = recruiter_id OR id = candidate_id) AND user_id = auth.uid()
    )
  );

-- SA verification policies (users can view own, recruiters can view candidates', service role can manage all)
CREATE POLICY "Users can view own SA verifications"
  ON sa_government_verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sa_government_verifications.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view candidate SA verifications"
  ON sa_government_verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = sa_government_verifications.profile_id AND candidate.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

CREATE POLICY "Service role can manage all SA verifications"
  ON sa_government_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Apply similar policies to all SA verification tables
CREATE POLICY "Users can view own SA identity verifications"
  ON sa_identity_verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = sa_identity_verifications.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all SA identity verifications"
  ON sa_identity_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- (Similar policies for other SA verification tables...)

-- Persona analyses policies
CREATE POLICY "Users can view own persona analysis"
  ON persona_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = persona_analyses.profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view candidate persona analysis"
  ON persona_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles candidate
      WHERE candidate.id = persona_analyses.profile_id AND candidate.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updates_updated_at
  BEFORE UPDATE ON availability_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_pipeline_positions_updated_at
  BEFORE UPDATE ON candidate_pipeline_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_scorecards_updated_at
  BEFORE UPDATE ON recruiter_scorecards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default pipeline stages for new recruiters
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'recruiter' THEN
    INSERT INTO pipeline_stages (recruiter_id, stage_name, stage_order, stage_color, auto_email_template) VALUES
    (NEW.id, 'Applied', 1, '#3b82f6', 'Thank you for your application. We have received your profile and will review it shortly.'),
    (NEW.id, 'Screening', 2, '#f59e0b', 'Congratulations! Your profile has passed our initial review. We would like to schedule a screening call.'),
    (NEW.id, 'Interview', 3, '#8b5cf6', 'Great news! We would like to invite you for an interview. Please let us know your availability.'),
    (NEW.id, 'Final Review', 4, '#f97316', 'You have progressed to our final review stage. We will be in touch with next steps soon.'),
    (NEW.id, 'Offer', 5, '#10b981', 'Excellent! We are pleased to extend you an offer. Please review the attached details.'),
    (NEW.id, 'Hired', 6, '#059669', 'Welcome to the team! We are excited to have you on board.'),
    (NEW.id, 'Rejected', 7, '#ef4444', 'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pipeline_stages_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();

-- Function to automatically send communication when candidate moves stages
CREATE OR REPLACE FUNCTION send_stage_move_communication()
RETURNS TRIGGER AS $$
DECLARE
  stage_template text;
  stage_name text;
  candidate_email text;
  recruiter_name text;
BEGIN
  -- Only trigger on stage changes, not initial inserts
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id) THEN
    -- Get stage template and name
    SELECT ps.auto_email_template, ps.stage_name
    INTO stage_template, stage_name
    FROM pipeline_stages ps
    WHERE ps.id = NEW.current_stage_id;
    
    -- Get candidate email and recruiter name
    SELECT c.email, r.first_name || ' ' || r.last_name
    INTO candidate_email, recruiter_name
    FROM profiles c, profiles r
    WHERE c.id = NEW.candidate_id AND r.id = NEW.recruiter_id;
    
    -- Only send if template exists
    IF stage_template IS NOT NULL AND stage_template != '' THEN
      INSERT INTO candidate_communications (
        recruiter_id,
        candidate_id,
        communication_type,
        trigger_event,
        subject,
        message_content
      ) VALUES (
        NEW.recruiter_id,
        NEW.candidate_id,
        'email',
        'stage_move',
        'Application Update: ' || stage_name,
        stage_template
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER send_stage_move_communication_trigger
  AFTER INSERT OR UPDATE OF current_stage_id ON candidate_pipeline_positions
  FOR EACH ROW
  EXECUTE FUNCTION send_stage_move_communication();

-- =============================================
-- SCORING FUNCTIONS
-- =============================================

-- Function to calculate SA ReelPass score with skills-first approach
CREATE OR REPLACE FUNCTION calculate_sa_reelpass_score(candidate_profile_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  
  -- Skills variables (50% total)
  total_skills integer := 0;
  verified_skills integer := 0;
  video_skills integer := 0;
  
  -- ReelPersona variables (20% total)
  persona_exists boolean := false;
  communication_score integer := 0;
  problem_solving_score integer := 0;
  leadership_score integer := 0;
  adaptability_score integer := 0;
  
  -- Government verification variables (20% total)
  identity_verified boolean := false;
  bee_verified boolean := false;
  
  -- Traditional credentials variables (10% total)
  education_count integer := 0;
  employment_count integer := 0;
  license_count integer := 0;
  seta_count integer := 0;
BEGIN
  -- SKILLS DEMONSTRATION - 50% of total score (50 points)
  
  -- Basic Skills Portfolio: 8 points (1.6 points per skill, max 5 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id
  INTO total_skills;
  
  score := score + LEAST(ROUND(total_skills * 1.6), 8);
  
  -- Verified Technical Skills: 30 points (4.3 points per verified skill, max 7 skills)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND verified = true
  INTO verified_skills;
  
  score := score + LEAST(ROUND(verified_skills * 4.3), 30);
  
  -- Video Skill Proofs: 12 points (2.4 points per video demo, max 5 videos)
  SELECT COUNT(*) FROM skills 
  WHERE profile_id = candidate_profile_id 
  AND video_verified = true
  AND video_demo_url IS NOT NULL
  INTO video_skills;
  
  score := score + LEAST(ROUND(video_skills * 2.4), 12);
  
  -- REELPERSONA ASSESSMENT - 20% of total score (20 points)
  
  -- Check if persona analysis exists
  SELECT EXISTS(
    SELECT 1 FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
  ) INTO persona_exists;
  
  IF persona_exists THEN
    -- Communication Skills: 5 points
    SELECT COALESCE(
      CASE 
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 80 THEN 5
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 60 THEN 4
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 40 THEN 3
        WHEN (assessment_data->>'communication_effectiveness')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO communication_score;
    
    score := score + communication_score;
    
    -- Problem Solving: 5 points
    SELECT COALESCE(
      CASE 
        WHEN (work_style->>'analytical_thinking')::integer >= 80 THEN 5
        WHEN (work_style->>'analytical_thinking')::integer >= 60 THEN 4
        WHEN (work_style->>'analytical_thinking')::integer >= 40 THEN 3
        WHEN (work_style->>'analytical_thinking')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO problem_solving_score;
    
    score := score + problem_solving_score;
    
    -- Leadership Potential: 5 points
    SELECT COALESCE(
      CASE 
        WHEN (cultural_fit->>'leadership_potential')::integer >= 80 THEN 5
        WHEN (cultural_fit->>'leadership_potential')::integer >= 60 THEN 4
        WHEN (cultural_fit->>'leadership_potential')::integer >= 40 THEN 3
        WHEN (cultural_fit->>'leadership_potential')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO leadership_score;
    
    score := score + leadership_score;
    
    -- Cultural Adaptability: 5 points
    SELECT COALESCE(
      CASE 
        WHEN (emotional_intelligence->>'adaptability')::integer >= 80 THEN 5
        WHEN (emotional_intelligence->>'adaptability')::integer >= 60 THEN 4
        WHEN (emotional_intelligence->>'adaptability')::integer >= 40 THEN 3
        WHEN (emotional_intelligence->>'adaptability')::integer >= 20 THEN 2
        ELSE 1
      END, 3
    ) FROM persona_analyses 
    WHERE profile_id = candidate_profile_id
    INTO adaptability_score;
    
    score := score + adaptability_score;
  END IF;
  
  -- GOVERNMENT TRUST & COMPLIANCE - 20% of total score (20 points)
  
  -- Home Affairs ID Verification: 12 points
  SELECT EXISTS(
    SELECT 1 FROM sa_identity_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO identity_verified;
  
  IF identity_verified THEN
    score := score + 12;
  END IF;
  
  -- BEE Status Verification: 8 points
  SELECT EXISTS(
    SELECT 1 FROM sa_bee_verifications 
    WHERE profile_id = candidate_profile_id 
    AND verification_status = 'verified'
  ) INTO bee_verified;
  
  IF bee_verified THEN
    score := score + 8;
  END IF;
  
  -- TRADITIONAL CREDENTIALS - 10% of total score (10 points)
  
  -- Education (SAQA): 4 points max
  SELECT COUNT(*) FROM sa_education_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO education_count;
  
  score := score + LEAST(education_count * 2, 4);
  
  -- Employment (SARS): 4 points max
  SELECT COUNT(*) FROM sa_employment_verifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO employment_count;
  
  score := score + LEAST(employment_count * 2, 4);
  
  -- Professional Licenses: 1 point max
  SELECT COUNT(*) FROM sa_professional_licenses 
  WHERE profile_id = candidate_profile_id 
  AND status = 'verified'
  INTO license_count;
  
  score := score + LEAST(license_count * 1, 1);
  
  -- SETA Certifications: 1 point max
  SELECT COUNT(*) FROM sa_seta_certifications 
  WHERE profile_id = candidate_profile_id 
  AND verification_status = 'verified'
  INTO seta_count;
  
  score := score + LEAST(seta_count * 1, 1);
  
  -- Ensure score doesn't exceed 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS
-- =============================================

-- Recruiter ratings summary view
CREATE OR REPLACE VIEW recruiter_ratings_summary AS
SELECT 
  r.id as recruiter_id,
  r.first_name,
  r.last_name,
  r.email,
  COUNT(rs.id) as total_reviews,
  ROUND(AVG(rs.communication_rating), 1) as avg_communication,
  ROUND(AVG(rs.professionalism_rating), 1) as avg_professionalism,
  ROUND(AVG(rs.role_accuracy_rating), 1) as avg_role_accuracy,
  ROUND(AVG(rs.overall_rating), 1) as overall_rating,
  COUNT(CASE WHEN rs.overall_rating >= 4.0 THEN 1 END) as positive_reviews,
  COUNT(CASE WHEN rs.overall_rating < 3.0 THEN 1 END) as negative_reviews
FROM profiles r
LEFT JOIN recruiter_scorecards rs ON r.id = rs.recruiter_id AND rs.is_public = true
WHERE r.role = 'recruiter'
GROUP BY r.id, r.first_name, r.last_name, r.email;

-- Live candidate availability view
CREATE OR REPLACE VIEW live_candidate_availability AS
SELECT 
  p.id as candidate_id,
  p.first_name,
  p.last_name,
  p.email,
  p.headline,
  p.completion_score as reelpass_score,
  p.province,
  p.bee_status,
  au.availability_status,
  au.available_from,
  au.notice_period_days,
  au.salary_expectation_min,
  au.salary_expectation_max,
  au.preferred_work_type,
  au.location_preferences,
  au.updated_at as availability_updated_at,
  CASE 
    WHEN p.completion_score >= 80 THEN 'verified'
    WHEN p.completion_score >= 60 THEN 'partial'
    ELSE 'unverified'
  END as verification_status
FROM profiles p
LEFT JOIN availability_updates au ON p.id = au.profile_id AND au.is_active = true
WHERE p.role = 'candidate'
ORDER BY au.updated_at DESC NULLS LAST, p.completion_score DESC;

-- SA ReelPass status view
CREATE OR REPLACE VIEW sa_reelpass_status AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.province,
  p.bee_status,
  p.completion_score as reelpass_score,
  CASE 
    WHEN p.completion_score >= 80 THEN 'verified'
    WHEN p.completion_score >= 60 THEN 'partial'
    ELSE 'unverified'
  END as reelpass_status,
  
  -- Skills metrics (highest priority - 50%)
  COALESCE(skill_count, 0) as verified_skill_count,
  COALESCE(video_skill_count, 0) as video_verified_skills,
  
  -- ReelPersona metrics (20%)
  CASE WHEN persona_v.profile_id IS NOT NULL THEN true ELSE false END as persona_assessed,
  COALESCE(persona_v.confidence_score, 0) as persona_confidence_score,
  
  -- Government verification metrics (trust layer - 20%)
  COALESCE(identity_count, 0) as verified_identity_checks,
  COALESCE(bee_count, 0) as verified_bee_count,
  
  -- Traditional credentials (supporting evidence - 10%)
  COALESCE(education_count, 0) as verified_education_count,
  COALESCE(employment_count, 0) as verified_employment_count,
  COALESCE(license_count, 0) as verified_license_count,
  COALESCE(seta_count, 0) as verified_seta_count

FROM profiles p
LEFT JOIN (
  SELECT profile_id, COUNT(*) as skill_count
  FROM skills 
  WHERE verified = true
  GROUP BY profile_id
) skill_v ON p.id = skill_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as video_skill_count
  FROM skills 
  WHERE video_verified = true AND video_demo_url IS NOT NULL
  GROUP BY profile_id
) video_skill_v ON p.id = video_skill_v.profile_id
LEFT JOIN (
  SELECT profile_id, confidence_score
  FROM persona_analyses
) persona_v ON p.id = persona_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as identity_count
  FROM sa_identity_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) id_v ON p.id = id_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as bee_count
  FROM sa_bee_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) bee_v ON p.id = bee_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as education_count
  FROM sa_education_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) edu_v ON p.id = edu_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as employment_count
  FROM sa_employment_verifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) emp_v ON p.id = emp_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as license_count
  FROM sa_professional_licenses 
  WHERE status = 'verified'
  GROUP BY profile_id
) lic_v ON p.id = lic_v.profile_id
LEFT JOIN (
  SELECT profile_id, COUNT(*) as seta_count
  FROM sa_seta_certifications 
  WHERE verification_status = 'verified'
  GROUP BY profile_id
) seta_v ON p.id = seta_v.profile_id

WHERE p.role = 'candidate';

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION calculate_sa_reelpass_score IS 
'Skills-first SA ReelPass with ReelPersona integration: 50% skills demonstration, 20% personality assessment, 20% government verification, 10% traditional credentials. Maximum 100 points total.';

COMMENT ON VIEW sa_reelpass_status IS 
'Comprehensive SA ReelPass status integrating ReelPersona assessments. Balances technical skills (50%) with personality insights (20%) and compliance verification.';

COMMENT ON VIEW live_candidate_availability IS 
'Real-time view of candidate availability status with ReelPass scores and verification levels for recruiter search and filtering.';

COMMENT ON VIEW recruiter_ratings_summary IS 
'Aggregated recruiter performance metrics from candidate feedback, supporting the public accountability scorecard system.';