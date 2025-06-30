import { supabase } from './supabase'
import type { SAGovernmentVerification, SAIdentityVerification, SABeeVerification } from './supabase'

export interface VerificationRequest {
  verificationType: 'id_verification' | 'tax_clearance' | 'criminal_record' | 'credit_check' | 'education_saqa' | 'professional_registration' | 'seta_certification' | 'bee_certificate'
  agency: 'home_affairs' | 'sars' | 'saps' | 'saqa' | 'department_labour' | 'department_education' | 'professional_councils' | 'seta_bodies' | 'bee_verification_agencies'
  verificationData: Record<string, any>
}

export interface VerificationResult {
  success: boolean
  verificationId: string
  status: 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
  message: string
  score?: number
}

export async function startVerification(
  profileId: string,
  request: VerificationRequest
): Promise<VerificationResult> {
  try {
    // Call the Supabase Edge Function for verification
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sa-government-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationType: request.verificationType,
        agency: request.agency,
        verificationData: request.verificationData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Verification API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    return {
      success: true,
      verificationId: result.verificationId,
      status: result.status,
      message: result.message || 'Verification request processed successfully',
      score: result.score
    }
  } catch (error) {
    console.error('Error starting verification:', error)
    return {
      success: false,
      verificationId: '',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getVerificationStatus(profileId: string): Promise<{
  reelpassScore: number
  reelpassStatus: 'verified' | 'partial' | 'unverified'
  verifications: SAGovernmentVerification[]
}> {
  try {
    // Get the SA ReelPass status
    const { data: reelpassData, error: reelpassError } = await supabase
      .from('sa_reelpass_status')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    if (reelpassError) {
      console.error('Error fetching ReelPass status:', reelpassError)
      throw new Error(`Failed to get ReelPass status: ${reelpassError.message}`)
    }

    // Get all verifications
    const { data: verifications, error: verificationsError } = await supabase
      .from('sa_government_verifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (verificationsError) {
      console.error('Error fetching verifications:', verificationsError)
      throw new Error(`Failed to get verifications: ${verificationsError.message}`)
    }

    return {
      reelpassScore: reelpassData.reelpass_score || 0,
      reelpassStatus: reelpassData.reelpass_status,
      verifications: verifications || []
    }
  } catch (error) {
    console.error('Error getting verification status:', error)
    throw error
  }
}

export async function getIdentityVerification(profileId: string): Promise<SAIdentityVerification | null> {
  try {
    const { data, error } = await supabase
      .from('sa_identity_verifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to get identity verification: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error getting identity verification:', error)
    return null
  }
}

export async function getBeeVerification(profileId: string): Promise<SABeeVerification | null> {
  try {
    const { data, error } = await supabase
      .from('sa_bee_verifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to get BEE verification: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error getting BEE verification:', error)
    return null
  }
}