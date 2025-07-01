import { supabase } from './supabase'
import type { Database } from '../types/supabase'

// Type aliases for better readability
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type Skill = Database['public']['Tables']['skills']['Row']
type AvailabilityUpdate = Database['public']['Tables']['availability_updates']['Row']

// Core profile functions as requested
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        email,
        first_name,
        last_name,
        username,
        avatar_url,
        bio,
        headline,
        location,
        phone,
        province,
        languages,
        bee_status,
        sa_id_number,
        tax_number,
        linkedin_url,
        github_url,
        website,
        work_permit_status,
        completion_score,
        reelpass_verified,
        role,
        is_deleted,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export const updateProfile = async (userId: string, updates: Partial<ProfileUpdate>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return null
  }
}

// Legacy functions - keeping for backward compatibility
export async function updateCandidateProfile(
  userId: string,
  profileData: {
    firstName?: string
    lastName?: string
    headline?: string
    completionScore?: number
    province?: Database['public']['Enums']['sa_province']
    beeStatus?: Database['public']['Enums']['bee_level']
    languages?: Database['public']['Enums']['sa_language'][]
  }
): Promise<Profile | null> {
  try {
    // Get the profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        headline: profileData.headline,
        completion_score: profileData.completionScore,
        province: profileData.province,
        bee_status: profileData.beeStatus,
        languages: profileData.languages,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    return updatedProfile
  } catch (error) {
    console.error('Error in updateCandidateProfile:', error)
    throw error
  }
}

export async function updateCandidateAvailability(
  userId: string,
  availabilityData: {
    status: Database['public']['Enums']['availability_status']
    availableFrom?: string
    noticePeriodDays?: number
    salaryMin?: number
    salaryMax?: number
    preferredWorkType?: string
    locationPreferences?: string[]
    notes?: string
  }
): Promise<AvailabilityUpdate | null> {
  try {
    // Get the profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // Deactivate any existing active availability updates
    const { error: deactivateError } = await supabase
      .from('availability_updates')
      .update({ is_active: false })
      .eq('profile_id', profile.id)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('Error deactivating existing availability:', deactivateError)
    }

    // Create a new availability update
    const { data: newAvailability, error: createError } = await supabase
      .from('availability_updates')
      .insert({
        profile_id: profile.id,
        availability_status: availabilityData.status,
        available_from: availabilityData.availableFrom,
        notice_period_days: availabilityData.noticePeriodDays,
        salary_expectation_min: availabilityData.salaryMin,
        salary_expectation_max: availabilityData.salaryMax,
        preferred_work_type: availabilityData.preferredWorkType,
        location_preferences: availabilityData.locationPreferences,
        notes: availabilityData.notes,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating availability update:', createError)
      throw new Error(`Failed to update availability: ${createError.message}`)
    }

    return newAvailability
  } catch (error) {
    console.error('Error in updateCandidateAvailability:', error)
    throw error
  }
}

export async function addCandidateSkill(
  userId: string,
  skillData: {
    name: string
    verified?: boolean
    videoVerified?: boolean
    videoUrl?: string
    proficiency?: string
    yearsExperience?: number
  }
): Promise<Skill | null> {
  try {
    // Get the profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // Add the skill
    const { data: newSkill, error: skillError } = await supabase
      .from('skills')
      .insert({
        profile_id: profile.id,
        name: skillData.name,
        verified: skillData.verified || false,
        video_verified: skillData.videoVerified || false,
        video_demo_url: skillData.videoUrl,
        proficiency: skillData.proficiency,
        years_experience: skillData.yearsExperience
      })
      .select()
      .single()

    if (skillError) {
      console.error('Error adding skill:', skillError)
      throw new Error(`Failed to add skill: ${skillError.message}`)
    }

    return newSkill
  } catch (error) {
    console.error('Error in addCandidateSkill:', error)
    throw error
  }
}

// Alias for backward compatibility
export const getCandidateProfile = getProfile

export async function getCandidateSkills(profileId: string): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('profile_id', profileId)

    if (error) {
      console.error('Error fetching skills:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCandidateSkills:', error)
    return []
  }
}

export async function getCandidateAvailability(profileId: string): Promise<AvailabilityUpdate | null> {
  try {
    const { data, error } = await supabase
      .from('availability_updates')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      console.error('Error fetching availability:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCandidateAvailability:', error)
    return null
  }
}