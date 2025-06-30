import { supabase } from './supabase'
import type { Interview } from './supabase'

export interface InterviewRequest {
  candidateName: string
  candidateEmail: string
  interviewType: 'video' | 'phone' | 'in-person'
  date: string
  time: string
  duration: string
  interviewers: string
  location?: string
  notes?: string
  timezone: string
}

export async function scheduleInterview(
  recruiterId: string,
  interviewData: InterviewRequest
): Promise<string> {
  try {
    const interviewDateTime = new Date(`${interviewData.date}T${interviewData.time}:00`)
    
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        recruiter_id: recruiterId,
        candidate_name: interviewData.candidateName,
        candidate_email: interviewData.candidateEmail,
        interview_type: interviewData.interviewType,
        scheduled_at: interviewDateTime.toISOString(),
        duration_minutes: parseInt(interviewData.duration),
        interviewers: interviewData.interviewers.split(',').map(email => email.trim()),
        location: interviewData.location || null,
        notes: interviewData.notes || null,
        timezone: interviewData.timezone,
        status: 'scheduled'
      })
      .select('id')
      .single()
    
    if (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`)
    }
    
    return data.id
  } catch (error) {
    console.error('Error scheduling interview:', error)
    throw error
  }
}

export async function getInterviews(recruiterId: string): Promise<Interview[]> {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('scheduled_at', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to get interviews: ${error.message}`)
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting interviews:', error)
    throw error
  }
}

export async function updateInterviewStatus(
  interviewId: string,
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('interviews')
      .update({ status })
      .eq('id', interviewId)
    
    if (error) {
      throw new Error(`Failed to update interview status: ${error.message}`)
    }
  } catch (error) {
    console.error('Error updating interview status:', error)
    throw error
  }
}

export async function rescheduleInterview(
  interviewId: string,
  newDate: string,
  newTime: string,
  newDuration?: string
): Promise<void> {
  try {
    const interviewDateTime = new Date(`${newDate}T${newTime}:00`)
    
    const updates: any = {
      scheduled_at: interviewDateTime.toISOString(),
      status: 'rescheduled'
    }
    
    if (newDuration) {
      updates.duration_minutes = parseInt(newDuration)
    }
    
    const { error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', interviewId)
    
    if (error) {
      throw new Error(`Failed to reschedule interview: ${error.message}`)
    }
  } catch (error) {
    console.error('Error rescheduling interview:', error)
    throw error
  }
}