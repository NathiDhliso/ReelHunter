// Test data setup for ReelHunter
// This script adds sample candidates to test the pipeline functionality

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestData() {
  console.log('Setting up test data for ReelHunter...');
  
  try {
    // 1. Create a test recruiter profile
    const testRecruiterEmail = 'recruiter@test.com';
    
    // First, create auth user (you'll need to do this manually in Supabase Auth)
    console.log(`Please create an auth user with email: ${testRecruiterEmail}`);
    console.log('Then run this script again with the user ID');
    
    // For now, let's assume you have a user ID
    const testUserId = process.env.TEST_USER_ID;
    
    if (!testUserId) {
      console.log('Please set TEST_USER_ID environment variable with your test user ID');
      return;
    }
    
    // Create or update recruiter profile
    const { data: recruiterProfile, error: recruiterError } = await supabase
      .from('profiles')
      .upsert({
        user_id: testUserId,
        email: testRecruiterEmail,
        role: 'recruiter',
        first_name: 'Test',
        last_name: 'Recruiter',
        headline: 'Senior Technical Recruiter',
        bio: 'Experienced recruiter specializing in tech talent acquisition',
        completion_score: 85
      })
      .select()
      .single();
    
    if (recruiterError) {
      console.error('Error creating recruiter profile:', recruiterError);
      return;
    }
    
    console.log('✅ Recruiter profile created:', recruiterProfile.id);
    
    // 2. Create sample candidate profiles
    const candidates = [
      {
        email: 'john.smith@example.com',
        role: 'candidate',
        first_name: 'John',
        last_name: 'Smith',
        headline: 'Full Stack Developer',
        bio: 'Experienced developer with React and Node.js expertise',
        completion_score: 92,
        reelpass_verified: true
      },
      {
        email: 'sarah.jones@example.com',
        role: 'candidate',
        first_name: 'Sarah',
        last_name: 'Jones',
        headline: 'Frontend Developer',
        bio: 'UI/UX focused developer with modern JavaScript skills',
        completion_score: 88,
        reelpass_verified: true
      },
      {
        email: 'mike.wilson@example.com',
        role: 'candidate',
        first_name: 'Mike',
        last_name: 'Wilson',
        headline: 'Backend Developer',
        bio: 'Python and Django specialist with cloud experience',
        completion_score: 90,
        reelpass_verified: false
      },
      {
        email: 'lisa.brown@example.com',
        role: 'candidate',
        first_name: 'Lisa',
        last_name: 'Brown',
        headline: 'DevOps Engineer',
        bio: 'Infrastructure automation and CI/CD pipeline expert',
        completion_score: 95,
        reelpass_verified: true
      }
    ];
    
    const { data: candidateProfiles, error: candidatesError } = await supabase
      .from('profiles')
      .upsert(candidates)
      .select();
    
    if (candidatesError) {
      console.error('Error creating candidate profiles:', candidatesError);
      return;
    }
    
    console.log(`✅ Created ${candidateProfiles.length} candidate profiles`);
    
    // 3. Get the default pipeline stages for the recruiter
    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('recruiter_id', recruiterProfile.id)
      .order('stage_order');
    
    if (stagesError || !stages || stages.length === 0) {
      console.error('No pipeline stages found. They should be created automatically.');
      return;
    }
    
    console.log(`✅ Found ${stages.length} pipeline stages`);
    
    // 4. Add candidates to different pipeline stages
    const pipelinePositions = [
      { candidate_id: candidateProfiles[0].id, stage_id: stages[0].id, notes: 'Strong technical background, good culture fit' },
      { candidate_id: candidateProfiles[1].id, stage_id: stages[1].id, notes: 'Excellent portfolio, needs to improve backend skills' },
      { candidate_id: candidateProfiles[2].id, stage_id: stages[2].id, notes: 'Great interview, discussing salary expectations' },
      { candidate_id: candidateProfiles[3].id, stage_id: stages[3].id, notes: 'Top candidate, preparing offer package' }
    ];
    
    const { error: positionsError } = await supabase
      .from('candidate_pipeline_positions')
      .upsert(
        pipelinePositions.map(pos => ({
          ...pos,
          recruiter_id: recruiterProfile.id
        }))
      );
    
    if (positionsError) {
      console.error('Error creating pipeline positions:', positionsError);
      return;
    }
    
    console.log('✅ Added candidates to pipeline stages');
    
    // 5. Add some skills for candidates
    const skills = [
      { profile_id: candidateProfiles[0].id, name: 'React', proficiency: 'expert', verified: true, years_experience: 5 },
      { profile_id: candidateProfiles[0].id, name: 'Node.js', proficiency: 'advanced', verified: true, years_experience: 4 },
      { profile_id: candidateProfiles[1].id, name: 'Vue.js', proficiency: 'advanced', verified: true, years_experience: 3 },
      { profile_id: candidateProfiles[1].id, name: 'CSS', proficiency: 'expert', verified: true, years_experience: 6 },
      { profile_id: candidateProfiles[2].id, name: 'Python', proficiency: 'expert', verified: true, years_experience: 7 },
      { profile_id: candidateProfiles[2].id, name: 'Django', proficiency: 'advanced', verified: true, years_experience: 5 },
      { profile_id: candidateProfiles[3].id, name: 'Docker', proficiency: 'expert', verified: true, years_experience: 4 },
      { profile_id: candidateProfiles[3].id, name: 'Kubernetes', proficiency: 'advanced', verified: true, years_experience: 3 }
    ];
    
    const { error: skillsError } = await supabase
      .from('skills')
      .upsert(skills);
    
    if (skillsError) {
      console.error('Error creating skills:', skillsError);
      return;
    }
    
    console.log('✅ Added skills for candidates');
    
    console.log('\n🎉 Test data setup complete!');
    console.log(`\nYou can now log in with:`);
    console.log(`Email: ${testRecruiterEmail}`);
    console.log(`Password: [the password you set when creating the auth user]`);
    console.log(`\nThe pipeline should now show 4 candidates across different stages.`);
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

// Run the setup
setupTestData(); 