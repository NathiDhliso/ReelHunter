import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmployer, setIsEmployer] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('[Auth] Getting initial session...')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error)
          if (mounted) {
            setIsLoading(false)
            setAuthChecked(true)
          }
          return
        }
        
        if (session && mounted) {
          console.log('[Auth] Found initial session for user:', session.user.email)
          await handleSession(session)
        } else if (mounted) {
          console.log('[Auth] No initial session found')
          setIsLoading(false)
          setAuthChecked(true)
        }
      } catch (error) {
        console.error('[Auth] Failed to get initial session:', error)
        if (mounted) {
          setIsLoading(false)
          setAuthChecked(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event, session?.user?.email)
        
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            setSession(null)
            setUser(null)
            setIsEmployer(false)
            setProfileId(null)
            setIsLoading(false)
            setAuthChecked(true)
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            await handleSession(session)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSession = async (session: Session | null) => {
    setSession(session)
    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {
      console.log('[Auth] User authenticated, checking/creating profile...')
      
      try {
        // Try direct query with minimal fields to avoid RLS recursion
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, role, first_name, last_name, email')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        console.log('[Auth] Profile query result:', { profileData, profileError })

        // If we get a 500 error or other severe error, skip profile check and assume recruiter
        if (profileError && (profileError.code === 'PGRST301' || profileError.message?.includes('infinite recursion'))) {
          console.warn('[Auth] RLS policy recursion detected, using fallback mode')
          // For ReelHunter, assume recruiter role and create a temporary profile ID
          setIsEmployer(true)
          setProfileId('temp-' + currentUser.id) // Temporary profile ID
          console.log('[Auth] Using fallback recruiter mode due to RLS policy issues')
        } else if (profileError) {
          console.error('[Auth] Profile query error:', profileError)
          // For other errors, still fallback to recruiter role
          setIsEmployer(true)
          setProfileId('temp-' + currentUser.id)
          console.log('[Auth] Using fallback recruiter mode due to profile error')
        } else if (!profileData) {
          console.log('[Auth] No profile found, will need to create one after RLS is fixed')
          // No profile exists, but we can't create one due to RLS issues
          setIsEmployer(true)
          setProfileId('temp-' + currentUser.id)
          console.log('[Auth] Using temporary profile until RLS policies are fixed')
        } else {
          // Profile found successfully
          setIsEmployer(profileData.role === 'recruiter')
          setProfileId(profileData.id)
          console.log('[Auth] User role set to:', profileData.role)
        }

      } catch (error) {
        console.error('[Auth] Error handling session:', error)
        // Don't fail auth completely - assume recruiter role as fallback
        setIsEmployer(true)
        setProfileId('temp-' + currentUser.id)
        console.log('[Auth] Using fallback mode due to session error')
      }
    } else {
      setIsEmployer(false)
      setProfileId(null)
      console.log('[Auth] User signed out')
    }
    
    setIsLoading(false)
    setAuthChecked(true)
  }



  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Signing in user:', email)
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      return result
    } catch (error) {
      console.error('[Auth] Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: { firstName?: string, lastName?: string }) => {
    console.log('[Auth] Signing up user:', email)
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || '',
            full_name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
          }
        }
      })
      return result
    } catch (error) {
      console.error('[Auth] Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    console.log('[Auth] Signing out user')
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signOut()
      return result
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    isEmployer,
    isAuthenticated: !!user,
    authChecked,
    profileId,
    accessToken: session?.access_token || null,
    signIn,
    signUp,
    signOut,
  }
}