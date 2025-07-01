import { supabase } from './supabase'
import type { Database } from '../types/supabase'

// Type aliases for better readability
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row']
export type CandidatePipelinePosition = Database['public']['Tables']['candidate_pipeline_positions']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export interface PipelineCandidate {
  id: string
  name: string
  email: string
  avatar: string
  addedAt: string
  notes?: string
  lastCommunication?: string
}

export interface PipelineStageWithCandidates extends PipelineStage {
  candidates: PipelineCandidate[]
}

export async function loadPipelineData(recruiterId: string): Promise<PipelineStageWithCandidates[]> {
  try {
    console.log("pipelineService.loadPipelineData - Starting with recruiterId:", recruiterId)
    
    // Get pipeline stages
    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('is_active', true)
      .order('stage_order')

    console.log("Pipeline stages query result:", { stages, error: stagesError })

    if (stagesError) {
      throw new Error(`Failed to fetch pipeline stages: ${stagesError.message}`)
    }

    if (!stages || stages.length === 0) {
      console.log("No stages found, creating default stages")
      // Create default stages if none exist
      await createDefaultStages(recruiterId)
      
      // Fetch the newly created stages
      const { data: newStages, error: newStagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('recruiter_id', recruiterId)
        .eq('is_active', true)
        .order('stage_order')
      
      console.log("New stages query result:", { newStages, error: newStagesError })
        
      if (newStagesError || !newStages || newStages.length === 0) {
        throw new Error(`Failed to create default pipeline stages: ${newStagesError?.message || 'Unknown error'}`)
      }
      
      return newStages.map(stage => ({
        ...stage,
        candidates: []
      }))
    }

    // Get candidate positions with profile data
    const { data: positions, error: positionsError } = await supabase
      .from('candidate_pipeline_positions')
      .select(`
        *,
        profiles!candidate_id (
          id,
          first_name,
          last_name,
          email,
          headline
        )
      `)
      .eq('recruiter_id', recruiterId)

    console.log("Candidate positions query result:", { 
      positionsCount: positions?.length || 0, 
      error: positionsError 
    })

    if (positionsError) {
      throw new Error(`Failed to fetch candidate positions: ${positionsError.message}`)
    }

    // Get latest communications for each candidate
    const { data: communications, error: communicationsError } = await supabase
      .from('candidate_communications')
      .select('candidate_id, sent_at')
      .eq('recruiter_id', recruiterId)
      .order('sent_at', { ascending: false })

    console.log("Communications query result:", { 
      communicationsCount: communications?.length || 0, 
      error: communicationsError 
    })

    if (communicationsError) {
      console.error('Failed to fetch communications:', communicationsError)
    }

    // Group communications by candidate
    const latestCommunicationByCandidate = (communications || []).reduce((acc, comm) => {
      if (!acc[comm.candidate_id] || new Date(comm.sent_at) > new Date(acc[comm.candidate_id])) {
        acc[comm.candidate_id] = comm.sent_at
      }
      return acc
    }, {} as Record<string, string>)

    // Group candidates by stage
    const candidatesByStage = (positions || []).reduce((acc, position) => {
      const stageId = position.current_stage_id
      if (!acc[stageId]) {
        acc[stageId] = []
      }

      const profile = position.profiles as Profile
      if (profile) {
        acc[stageId].push({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
          email: profile.email,
          avatar: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'UN',
          addedAt: position.created_at,
          notes: position.notes || undefined,
          lastCommunication: latestCommunicationByCandidate[profile.id]
        })
      }

      return acc
    }, {} as Record<string, PipelineCandidate[]>)

    console.log("Candidates grouped by stage:", Object.keys(candidatesByStage).length)

    // Combine stages with their candidates
    const result = stages.map(stage => ({
      ...stage,
      candidates: candidatesByStage[stage.id] || []
    }))

    console.log("Final pipeline data:", result.length, "stages")
    return result

  } catch (error) {
    console.error('Error loading pipeline data:', error)
    throw error
  }
}

export async function createDefaultStages(recruiterId: string): Promise<void> {
  try {
    console.log("Creating default stages for recruiter:", recruiterId)
    const defaultStages = [
      {
        recruiter_id: recruiterId,
        stage_name: 'Applied',
        stage_order: 1,
        stage_color: '#3b82f6',
        auto_email_template: 'Thank you for your application. We have received your profile and will review it shortly.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Screening',
        stage_order: 2,
        stage_color: '#f59e0b',
        auto_email_template: 'Congratulations! Your profile has passed our initial review. We would like to schedule a screening call with you.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Interview',
        stage_order: 3,
        stage_color: '#8b5cf6',
        auto_email_template: 'Great news! We would like to invite you for an interview. Please let us know your availability for the coming week.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Final Review',
        stage_order: 4,
        stage_color: '#f97316',
        auto_email_template: 'You have progressed to our final review stage. We will be in touch with next steps within 2-3 business days.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Offer',
        stage_order: 5,
        stage_color: '#10b981',
        auto_email_template: 'Excellent! We are pleased to extend you an offer. Please review the attached details and let us know if you have any questions.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Hired',
        stage_order: 6,
        stage_color: '#059669',
        auto_email_template: 'Welcome to the team! We are excited to have you on board. HR will be in touch with onboarding details.',
        is_active: true
      },
      {
        recruiter_id: recruiterId,
        stage_name: 'Rejected',
        stage_order: 7,
        stage_color: '#ef4444',
        auto_email_template: 'Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.',
        is_active: true
      }
    ]
    
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert(defaultStages)
      .select()
      
    console.log("Default stages creation result:", { data, error })
      
    if (error) {
      throw new Error(`Failed to create default stages: ${error.message}`)
    }
  } catch (error) {
    console.error('Error creating default pipeline stages:', error)
    throw error
  }
}

export async function moveCandidateToStage(
  candidateId: string,
  fromStageId: string,
  toStageId: string,
  recruiterId: string,
  notes?: string
): Promise<void> {
  try {
    console.log("Moving candidate:", { candidateId, fromStageId, toStageId, recruiterId })
    
    // Check if candidate is already in the pipeline
    const { data: existingPosition, error: checkError } = await supabase
      .from('candidate_pipeline_positions')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .single()

    console.log("Check existing position result:", { existingPosition, error: checkError })

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to check candidate position: ${checkError.message}`)
    }

    if (existingPosition) {
      // Update existing position
      const { data, error } = await supabase
        .from('candidate_pipeline_positions')
        .update({
          previous_stage_id: fromStageId,
          current_stage_id: toStageId,
          moved_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPosition.id)
        .select()

      console.log("Update position result:", { data, error })

      if (error) {
        throw new Error(`Failed to update candidate position: ${error.message}`)
      }
    } else {
      // Insert new position
      const { data, error } = await supabase
        .from('candidate_pipeline_positions')
        .insert({
          recruiter_id: recruiterId,
          candidate_id: candidateId,
          current_stage_id: toStageId,
          moved_at: new Date().toISOString(),
          notes: notes || null
        })
        .select()

      console.log("Insert position result:", { data, error })

      if (error) {
        throw new Error(`Failed to insert candidate position: ${error.message}`)
      }
    }
  } catch (error) {
    console.error('Error moving candidate:', error)
    throw error
  }
}

export async function addCandidateToPipeline(
  candidateId: string,
  recruiterId: string,
  stageId: string,
  notes?: string
): Promise<void> {
  try {
    console.log("Adding candidate to pipeline:", { candidateId, recruiterId, stageId })
    
    // Check if candidate is already in the pipeline
    const { data: existingPosition, error: checkError } = await supabase
      .from('candidate_pipeline_positions')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .single()

    console.log("Check existing position result:", { existingPosition, error: checkError })

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to check candidate position: ${checkError.message}`)
    }

    if (existingPosition) {
      throw new Error('Candidate is already in your pipeline')
    }

    // Insert new position
    const { data, error } = await supabase
      .from('candidate_pipeline_positions')
      .insert({
        recruiter_id: recruiterId,
        candidate_id: candidateId,
        current_stage_id: stageId,
        moved_at: new Date().toISOString(),
        notes: notes || null
      })
      .select()

    console.log("Insert position result:", { data, error })

    if (error) {
      throw new Error(`Failed to add candidate to pipeline: ${error.message}`)
    }
  } catch (error) {
    console.error('Error adding candidate to pipeline:', error)
    throw error
  }
}

export async function removeCandidateFromPipeline(
  candidateId: string,
  recruiterId: string
): Promise<void> {
  try {
    console.log("Removing candidate from pipeline:", { candidateId, recruiterId })
    
    const { data, error } = await supabase
      .from('candidate_pipeline_positions')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .select()

    console.log("Remove position result:", { data, error })

    if (error) {
      throw new Error(`Failed to remove candidate from pipeline: ${error.message}`)
    }
  } catch (error) {
    console.error('Error removing candidate from pipeline:', error)
    throw error
  }
}

export async function getDefaultPipelineStage(recruiterId: string): Promise<string | null> {
  try {
    console.log("Getting default pipeline stage for recruiter:", recruiterId)
    
    // Get the "Applied" stage or the first stage
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('is_active', true)
      .or('stage_name.eq.Applied,stage_order.eq.1')
      .order('stage_order')
      .limit(1)
      .single()

    console.log("Default stage query result:", { data, error })

    if (error) {
      console.error('Failed to get default pipeline stage:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('Error getting default pipeline stage:', error)
    return null
  }
}