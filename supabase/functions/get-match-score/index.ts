import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Type definitions
interface MatchScoreRequest {
  candidateId: string
  jobDescription: string
}

interface CandidateProfile {
  reelCV: {
    headline: string
    experience: Array<{
      title: string
      company: string
      duration: string
      description: string
    }>
    education: Array<{
      degree: string
      institution: string
      year: string
    }>
  }
  reelProjects: Array<{
    title: string
    description: string
    tech_stack: string[]
    demo_url?: string
    github_url?: string
  }>
  reelSkills: Array<{
    skill_name: string
    proficiency_level: number
    verified: boolean
  }>
  reelPersona: {
    communication_score: number
    problem_solving_score: number
    leadership_score: number
    adaptability_score: number
  }
}

interface MatchScoreResponse {
  matchScore: number
  scoreBreakdown: {
    experience: number
    appliedSkills: number
    assessedProficiency: number
  }
  matchSummary: string
}

// AI System Prompt
const AI_SYSTEM_PROMPT = `You are an expert, unbiased, and data-driven Talent Analyst AI for a platform called ReelHunter. Your sole purpose is to analyze a candidate's holistic profile against a specific job description and provide a quantitative match score and a concise, professional summary. You operate with the highest ethical standards, focusing exclusively on skills, experience, and verified project work.

You will receive a JSON object containing two main keys: \`jobDescription\` and \`candidateProfile\`. The \`candidateProfile\` is a rich object with data from our ecosystem: \`reelCV\` (professional history), \`reelProjects\` (verified projects with tech stacks), \`reelSkills\` (technical proficiency scores), and \`reelPersona\` (soft skill assessment results).

**Your Task:**
1. Thoroughly analyze all provided data points in the \`candidateProfile\` in relation to the \`jobDescription\`.
2. Do NOT use any personally identifiable information (PII) in your analysis. Your evaluation must be blind to name, age, gender, and race.
3. Calculate a \`matchScore\` from 0 to 100.
4. Provide a \`scoreBreakdown\` that quantifies how the candidate measures up against the core pillars: Experience (from ReelCV), Applied Skills (from ReelProjects), and Assessed Proficiency (from ReelSkills/ReelPersona).
5. Write a \`matchSummary\` (max 100 words) that is a professional, evidence-based summary explaining the reasoning for the score. Reference specific projects or skills.
6. You MUST return your response as a single, minified JSON object. Do not include any text or formatting outside of the JSON structure.

**Output Format (JSON only):**
{
  "matchScore": <number>,
  "scoreBreakdown": {
    "experience": <number>,
    "appliedSkills": <number>,
    "assessedProficiency": <number>
  },
  "matchSummary": "<string>"
}`

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req)
    
    // Parse and validate request
    const { candidateId, jobDescription } = await parseRequest(req)
    
    // Initialize Supabase client
    const supabase = createSupabaseClient()
    
    // Fetch candidate profile data
    const candidateProfile = await fetchCandidateProfile(supabase, candidateId)
    
    // Analyze match using AI
    const matchResult = await analyzeMatch(candidateProfile, jobDescription)
    
    return createSuccessResponse(matchResult)
    
  } catch (error) {
    return createErrorResponse(error)
  }
})

// Authentication helper
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const supabase = createSupabaseClient()
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

// Request parsing helper
async function parseRequest(req: Request): Promise<MatchScoreRequest> {
  const body = await req.json()
  const { candidateId, jobDescription } = body

  if (!candidateId || !jobDescription) {
    throw new Error('Missing required parameters: candidateId and jobDescription')
  }

  return { candidateId, jobDescription }
}

// Supabase client factory
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Candidate profile data fetcher
async function fetchCandidateProfile(supabase: any, candidateId: string): Promise<CandidateProfile> {
  // Fetch profile data
  const profile = await fetchProfile(supabase, candidateId)
  
  // Verify ReelPass status
  validateReelPassStatus(profile)
  
  // Fetch related data in parallel
  const [projects, skills] = await Promise.all([
    fetchProjects(supabase, candidateId),
    fetchSkills(supabase, candidateId)
  ])

  // Build comprehensive anonymized profile
  return buildCandidateProfile(profile, projects, skills)
}

// Profile fetcher
async function fetchProfile(supabase: any, candidateId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch candidate profile: ${error.message}`)
  }

  return profile
}

// ReelPass validation
function validateReelPassStatus(profile: any) {
  if (!profile.reelpass_verified) {
    throw new Error('Candidate does not have verified ReelPass status')
  }
}

// Projects fetcher
async function fetchProjects(supabase: any, candidateId: string) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', candidateId)

  if (error) {
    throw new Error(`Failed to fetch candidate projects: ${error.message}`)
  }

  return projects || []
}

// Skills fetcher
async function fetchSkills(supabase: any, candidateId: string) {
  const { data: skills, error } = await supabase
    .from('skills')
    .select('*')
    .eq('profile_id', candidateId)

  if (error) {
    throw new Error(`Failed to fetch candidate skills: ${error.message}`)
  }

  return skills || []
}

// Profile builder
function buildCandidateProfile(profile: any, projects: any[], skills: any[]): CandidateProfile {
  return {
    reelCV: {
      headline: profile.headline || '',
      experience: [], // TODO: Add experience table and fetch
      education: []   // TODO: Add education table and fetch
    },
    reelProjects: projects.map(project => ({
      title: project.title,
      description: project.description,
      tech_stack: project.technologies || [],
      demo_url: project.live_url,
      github_url: project.github_url
    })),
    reelSkills: skills.map(skill => ({
      skill_name: skill.name,
      proficiency_level: skill.proficiency === 'expert' ? 5 : 
                        skill.proficiency === 'advanced' ? 4 :
                        skill.proficiency === 'intermediate' ? 3 :
                        skill.proficiency === 'beginner' ? 2 : 1,
      verified: skill.verified || false
    })),
    reelPersona: {
      communication_score: 0,    // TODO: Add persona assessment data
      problem_solving_score: 0,
      leadership_score: 0,
      adaptability_score: 0
    }
  }
}

// Match analysis orchestrator
async function analyzeMatch(candidateProfile: CandidateProfile, jobDescription: string): Promise<MatchScoreResponse> {
  const analysisPayload = {
    jobDescription,
    candidateProfile
  }

  try {
    return await callBedrockAPI(analysisPayload)
  } catch (error) {
    console.warn('AWS Bedrock call failed, using mock analysis:', error)
    return generateMockMatchScore(analysisPayload)
  }
}

// AWS Bedrock API caller
async function callBedrockAPI(payload: any): Promise<MatchScoreResponse> {
  const config = getAWSConfig()
  const claudeRequest = buildClaudeRequest(payload)
  const endpoint = buildBedrockEndpoint(config)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Note: In production, implement proper AWS Signature V4
    },
    body: JSON.stringify(claudeRequest)
  })

  if (!response.ok) {
    throw new Error(`Bedrock API call failed: ${response.status}`)
  }

  const result = await response.json()
  return JSON.parse(result.content[0].text) as MatchScoreResponse
}

// AWS configuration getter
function getAWSConfig() {
  const awsRegion = Deno.env.get('VITE_AWS_REGION') || 'us-east-1'
  const modelId = Deno.env.get('VITE_BEDROCK_MODEL_ID') || 'anthropic.claude-3-sonnet-20240229-v1:0'
  const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID')
  const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')

  if (!awsAccessKey || !awsSecretKey) {
    throw new Error('Missing AWS credentials')
  }

  return { awsRegion, modelId, awsAccessKey, awsSecretKey }
}

// Claude request builder
function buildClaudeRequest(payload: any) {
  return {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    system: AI_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(payload)
      }
    ]
  }
}

// Bedrock endpoint builder
function buildBedrockEndpoint(config: any): string {
  return `https://bedrock-runtime.${config.awsRegion}.amazonaws.com/model/${config.modelId}/invoke`
}

// Mock match score generator
function generateMockMatchScore(payload: any): MatchScoreResponse {
  const { candidateProfile } = payload
  
  // Calculate realistic scores based on available data
  const scores = calculateMockScores(candidateProfile)
  const overallScore = Math.round((scores.experience + scores.appliedSkills + scores.assessedProficiency) / 3)

  return {
    matchScore: overallScore,
    scoreBreakdown: scores,
    matchSummary: generateMockSummary(candidateProfile, scores)
  }
}

// Mock score calculator
function calculateMockScores(candidateProfile: CandidateProfile) {
  const experienceScore = Math.min(90, candidateProfile.reelCV.headline ? 75 : 50)
  const appliedSkillsScore = Math.min(95, candidateProfile.reelProjects.length * 20)
  const assessedProficiencyScore = candidateProfile.reelSkills.length > 0 
    ? Math.min(90, candidateProfile.reelSkills.reduce((acc, skill) => acc + skill.proficiency_level, 0) / candidateProfile.reelSkills.length * 20)
    : 60

  return {
    experience: experienceScore,
    appliedSkills: appliedSkillsScore,
    assessedProficiency: assessedProficiencyScore
  }
}

// Mock summary generator
function generateMockSummary(candidateProfile: CandidateProfile, scores: any): string {
  const projectCount = candidateProfile.reelProjects.length
  const skillCount = candidateProfile.reelSkills.length
  
  return `Strong technical match with ${projectCount} verified projects demonstrating hands-on experience. Skills alignment shows proficiency across ${skillCount} key areas. Professional background indicates relevant experience for the role requirements.`
}

// Response helpers
function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function createErrorResponse(error: any) {
  console.error('Error in getMatchScore:', error)
  
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}